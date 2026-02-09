package com.questionservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Data
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String questionTitle;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String rightAnswer;
    private String difficultyLevel;
    private String category;
    private LocalDateTime createdAt ;

    private String question_code;

    @PrePersist
    protected void onCreate(){
        this.createdAt=LocalDateTime.now();
    }

}
