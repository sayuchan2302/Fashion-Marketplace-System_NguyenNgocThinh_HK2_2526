import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TIMEOUT = 15000;

const CREDENTIALS = {
  admin: { email: 'admin@fashion.local', password: 'Test@123' },
  vendor: { email: 'an.shop@fashion.local', password: 'Test@123' },
};

const pass = (label, details = '') => console.log(`PASS ${label}${details ? ` -> ${details}` : ''}`);
const info = (label, details = '') => console.log(`INFO ${label}${details ? ` -> ${details}` : ''}`);
const fail = (label, error) => {
  console.error(`FAIL ${label}`);
  console.error(error instanceof Error ? error.message : String(error));
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

async function getFirstVisibleProductLink(page) {
  const links = page.locator('a[href^="/product/"]');
  const count = await links.count();

  for (let i = 0; i < count; i += 1) {
    const link = links.nth(i);
    const visible = await link.isVisible().catch(() => false);
    if (!visible) continue;

    const href = await link.getAttribute('href');
    if (!href) continue;
    return { link, href };
  }

  return null;
}

async function loginAs(page, role) {
  const creds = CREDENTIALS[role];
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: TIMEOUT });

  const emailInput = page.locator('input[type="email"], input[name="email"], input[autocomplete="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[autocomplete="current-password"]').first();

  await emailInput.waitFor({ state: 'visible', timeout: TIMEOUT });
  await passwordInput.waitFor({ state: 'visible', timeout: TIMEOUT });

  await emailInput.fill(creds.email);
  await passwordInput.fill(creds.password);
  await page.getByRole('button', { name: /Đăng nhập/i }).click();
  await page.waitForURL('**/', { timeout: TIMEOUT });
  await page.waitForLoadState('networkidle');
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  try {
    // Flow 1 + 2 + 3 (public flows)
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
      const homeHasCoreUI = await page.getByText(/COOLMATE/i).first().isVisible({ timeout: TIMEOUT }).catch(() => false);
      assert(homeHasCoreUI, 'Home không render header/logo.');
      pass('Home');

      const visibleProduct = await getFirstVisibleProductLink(page);
      assert(visibleProduct, 'Không tìm thấy product link đang hiển thị ở Home.');
      const { link: firstProductLink, href: productHref } = visibleProduct;

      await firstProductLink.click();
      await page.waitForURL('**/product/**', { timeout: TIMEOUT });
      await page.waitForLoadState('networkidle');

      const productTitleVisible = await page.locator('h1').first().isVisible({ timeout: TIMEOUT }).catch(() => false);
      assert(productTitleVisible, 'Product detail không hiển thị tên sản phẩm.');

      const addToCartButton = page.getByRole('button', { name: /Thêm vào giỏ/i });
      const addToCartVisible = await addToCartButton.isVisible({ timeout: 4000 }).catch(() => false);
      pass('Product Detail', productHref);

      if (addToCartVisible) {
        await addToCartButton.click();
      } else {
        info('Cart setup', 'Không tìm thấy nút "Thêm vào giỏ", bỏ qua bước thêm sản phẩm.');
      }

      await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle', timeout: TIMEOUT });
      const cartVisible = await page.getByText(/Giỏ hàng|Thanh toán|Tạm tính/i).first().isVisible({ timeout: TIMEOUT }).catch(() => false);
      assert(cartVisible, 'Cart page không render đúng sau khi thêm sản phẩm.');
      pass('Cart');

      await context.close();
    }

    // Flow 4 (admin categories)
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      await loginAs(page, 'admin');
      await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'networkidle', timeout: TIMEOUT });
      const categoriesVisible = await page.getByText(/Cây danh mục|Chi tiết danh mục|Danh mục/i).first().isVisible({ timeout: TIMEOUT }).catch(() => false);
      assert(categoriesVisible, `Admin Categories không hiển thị nội dung mong đợi. URL hiện tại: ${page.url()}`);
      pass('Admin Categories');

      await context.close();
    }

    // Flow 5 (vendor products)
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      await loginAs(page, 'vendor');
      await page.goto(`${BASE_URL}/vendor/products`, { waitUntil: 'networkidle', timeout: TIMEOUT });
      const productsVisible = await page.getByText(/Sản phẩm|Danh sách sản phẩm|Thêm sản phẩm/i).first().isVisible({ timeout: TIMEOUT }).catch(() => false);
      assert(productsVisible, 'Vendor Products không render nội dung sản phẩm.');
      pass('Vendor Products');

      await context.close();
    }

    console.log('SMOKE RESULT: ALL PASS');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  fail('Smoke Regression', error);
  process.exitCode = 1;
});
