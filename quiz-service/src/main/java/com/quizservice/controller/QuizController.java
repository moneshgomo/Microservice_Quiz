package com.quizservice.controller;

import com.quizservice.model.*;
import com.quizservice.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.env.Environment;
import java.util.List;


@RestController
@RequestMapping("/quiz")
public class QuizController {

    @Autowired
    QuizService quizService;

    @Autowired
    Environment environment;

    // adding endpoits for testing, will remove later
    @GetMapping("/test")
    public ResponseEntity<String> checkService() {
        return ResponseEntity
                .ok("Quiz Service is up and running on port: " + environment.getProperty("local.server.port"));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    @PostMapping("/create")
    public ResponseEntity<String> createQuiz(@RequestBody QuizCreateRequestNO_CODE quizDto) {
        return quizService.createQuiz(
                quizDto.categoryName(),
                quizDto.numQuestions(),
                quizDto.title()
        );
    }



    @PostMapping("/create/code")
    public ResponseEntity<String> createQuizUsingCode(@RequestBody QuizCreateRequestWith_CODE questionCode) {
        return quizService.createPrivateQuiz(questionCode);
    }

    @PostMapping("/attend_Quiz")
    public ResponseEntity<QuizResponse> getQuizBasedOnCode(@RequestParam String quiz_code){
        return quizService.getQuizBasedOnQuizCode(quiz_code);
    }



    @GetMapping("/get/{id}")
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(@PathVariable Integer id) {
        return quizService.getQuizQuestions(id);
    }

    @PostMapping("/submit/{id}")
    public ResponseEntity<Integer> submitQuiz(@PathVariable Integer id, @RequestBody List<Response> responses) {
        return quizService.calculateResult(id, responses);
    }

    @GetMapping("/categories")  // remove later
    public ResponseEntity<List<String>> getCategories() {
        return quizService.getCategories();
    }

}
