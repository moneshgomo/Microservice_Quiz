package com.questionservice.controller;


import com.questionservice.model.Question;
import com.questionservice.model.QuestionWrapper;
import com.questionservice.model.Response;
import com.questionservice.service.QuestionService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/question")  // NEED TO UPDATE THE ENDPOINTS BASED ON OPEN API SPECS
public class QuestionController {

    @Autowired
    QuestionService questionService;

    private static final Logger logger =
            LoggerFactory.getLogger(QuestionController.class);
    @Autowired
    Environment environment;


    @GetMapping("/test")
    public ResponseEntity<String> checkService(){
        return ResponseEntity.ok("Question Service is up and running on port: " + environment.getProperty("local.server.port"));
    }


    @GetMapping("/allQuestions")
    public ResponseEntity<List<Question>> getAllQuestions(){
        return questionService.getAllQuestions();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Question>> getQuestionsByCategory(@PathVariable String category){
        return questionService.getQuestionsByCategory(category);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addQuestion(@RequestBody List<Question> question){
        return  questionService.addQuestion(question);
    }

    @GetMapping("/generate")
    public ResponseEntity<List<Integer>> getQuestionsForQuiz
            (@RequestParam String categoryName, @RequestParam Integer numQuestions ){
        return questionService.getQuestionsForQuiz(categoryName, numQuestions);
    }

    @PostMapping("/getQuestions")
    public ResponseEntity<List<QuestionWrapper>> getQuestionsFromId(@RequestBody List<Integer> questionIds){
        System.out.println(environment.getProperty("local.server.port"));
        return questionService.getQuestionsFromId(questionIds);
    }

    @GetMapping("/questions_code")  // get questions based on code
    public ResponseEntity<List<Integer>> getQuestionsBasedOnQuestionCode(
            @RequestParam("questionCode") String questionCode) {

        logger.info("Fetching questions for questionCode: {}", questionCode);

        List<Integer> questions = questionService.getQuestionBasedOnQuestion_Code(questionCode);

        if (questions == null || questions.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(questions);
    }




    @PostMapping("/getScore")
    public ResponseEntity<Integer> getScore(@RequestBody List<Response> responses)
    {
        return questionService.getScore(responses);
    }

    @GetMapping("/getCategories")
    public ResponseEntity<List<String>> getCategories(){
        return questionService.getCategories();
    }


}
