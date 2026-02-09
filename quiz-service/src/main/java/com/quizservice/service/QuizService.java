package com.quizservice.service;

import com.quizservice.dao.QuizDao;
import com.quizservice.feign.QuizInterface;
import com.quizservice.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
public class QuizService {

    @Autowired
    QuizDao quizDao;


   private final QuizInterface quizInterface;

    public QuizService(QuizInterface quizInterface) {
        this.quizInterface = quizInterface;
    }

    private  final String CODE_PATTERNS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*())_";

    private static final int RANDOM_LENGTH = 10;

    private final Random random = new Random();



    public ResponseEntity<String> createQuiz(String category, int numQ, String title) {

        return null;
    }  // hold this public quiz



    public ResponseEntity<String> createPrivateQuiz(QuizCreateRequestWith_CODE quizCreateRequestWithCode) {

//
//        String question_code = quizCreateRequestWithCode.QUIZ_GENERATOR_CODE();
//        System.out.println("Question code sent: " + question_code);

        System.out.println("createQuiz method triggered");
        log.info("Full request: {}", quizCreateRequestWithCode);
        List<Integer> questions = quizInterface.getQuestionsBasedOnQuestionCode(quizCreateRequestWithCode.QUIZ_GENERATOR_CODE()).getBody();
        Quiz quiz = new Quiz();

        quiz.setTitle(quizCreateRequestWithCode.title());
        String alterQuestionCodeToQuizCode = quizCreateRequestWithCode.QUIZ_GENERATOR_CODE();
        String QUIZ_CODE = generateQuestionCode(alterQuestionCodeToQuizCode);
        quiz.setQuizCode(QUIZ_CODE);
        quiz.setQuestionIds(questions);

        quizDao.save(quiz);


        return new ResponseEntity<>(QUIZ_CODE, HttpStatus.CREATED);

    }
    private String generateQuestionCode(String alterQuestionCodeToQuizCode ) {

        String timePart = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("HHmmss"));

        StringBuilder randomPart = new StringBuilder();
        for (int i = 0; i < RANDOM_LENGTH; i++) {
            int index = random.nextInt(CODE_PATTERNS.length());
            randomPart.append(CODE_PATTERNS.charAt(index));
        }

        return "quiz_"+timePart + randomPart.toString();
    }
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(Integer id) {
        Quiz quiz = quizDao.findById(id).get();
        List<Integer> questionIds = quiz.getQuestionIds(); // list of questions ID
        ResponseEntity<List<QuestionWrapper>> questions = quizInterface.getQuestionsFromId(questionIds);
        return questions;

    }
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(String quizCode) {

        List<Integer> questionIds = quizDao.findByQuizCode(quizCode); // list of questions ID
        ResponseEntity<List<QuestionWrapper>> questions = quizInterface.getQuestionsFromId(questionIds);
        return questions;

    }

    public ResponseEntity<Integer> calculateResult(Integer id, List<Response> responses) {
        log.info("Incoming answer : {}",responses);
        ResponseEntity<Integer> score = quizInterface.getScore(responses);
        return score;
    }

    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return new ResponseEntity<>(quizDao.findQuizzesWithNullCode(), HttpStatus.OK);
    }

    public ResponseEntity<List<String>> getCategories() {
        return quizInterface.getCategories();
    }



    public ResponseEntity<QuizResponse> getQuizBasedOnQuizCode(String quizCode) {

        Optional<Quiz> optionalQuiz = quizDao.findByQuizByCode(quizCode);

        if (optionalQuiz.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Quiz quiz = optionalQuiz.get();
        Long quizId = Long.valueOf(quiz.getId());
        List<Integer> questionIds = quiz.getQuestionIds();

        List<QuestionWrapper> questions =
                quizInterface.getQuestionsFromId(questionIds).getBody();

        QuizResponse response =
                new QuizResponse(quizId,quiz.getTitle(), questions);

        return ResponseEntity.ok(response);
    }



}
