package com.gomo.authService.dto;


public class LoginResponseDTO {

    private String token;

    public LoginResponseDTO(String incomingToken){
        this.token=incomingToken;
    }

    public String getToken() {
        return token;
    }
}
