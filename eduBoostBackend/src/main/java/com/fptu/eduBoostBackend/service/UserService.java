package com.fptu.eduBoostBackend.service;


import com.fptu.eduBoostBackend.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getMyProfile();
    UserProfileResponse getUserByPhone(String phone);
}
