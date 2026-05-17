package vn.edu.hcmuaf.fit.marketplace.service;

public record FacebookUserInfo(
    String id,
    String email,
    String name,
    String picture
) {
    public String subject() {
        return id;
    }
}