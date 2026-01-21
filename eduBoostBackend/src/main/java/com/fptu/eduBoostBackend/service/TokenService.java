package com.fptu.eduBoostBackend.service;


import com.fptu.eduBoostBackend.entities.User;


public interface TokenService {

    String generateToken(User user);


    User validateAndGetUser(String token);

    void invalidateAllTokens(User user);
}