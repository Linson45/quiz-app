"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";

const QuizContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const QuestionContainer = styled.div`
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const QuestionText = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

const OptionButton = styled.button`
  display: block;
  width: 100%;
  padding: 15px;
  margin-bottom: 10px;
  font-size: 18px;
  text-align: left;
  background-color: ${(props) => (props.selected ? "#007bff" : "#fff")};
  color: ${(props) => (props.selected ? "#fff" : "#000")};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.selected ? "#0056b3" : "#e0e0e0")};
  }
`;

const SubmitButton = styled.button`
  padding: 15px 30px;
  font-size: 18px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const AnswerContainer = styled.div`
  margin-top: 20px;
`;

const AnswerText = styled.p`
  font-size: 18px;
  margin-bottom: 10px;
`;

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/quiz");
        if (!response.ok) {
          throw new Error("Failed to fetch quiz questions");
        }
        const data = await response.json();
        setQuestions(data.questions);
        setSelectedOptions(Array(data.questions.length).fill(null));
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleOptionChange = (option) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[currentQuestion] = option;
    setSelectedOptions(updatedOptions);

    // Check if the selected option is correct
    const currentQuestionIndex = currentQuestion;
    const currentQuestionOptions = questions[currentQuestionIndex].options;
    const correctOption = currentQuestionOptions.find(
      (opt) => opt === questions[currentQuestionIndex].correctAnswer
    );

    // Update the score if the selected option is correct
    if (option === correctOption) {
      setScore(score + 1);
    }

    // Show the answer immediately
    setShowAnswer(true);
  };

  const handleSubmit = async () => {
    try {
      const answers = selectedOptions.map((option, index) => ({
        questionId: questions[index].id,
        selectedOption: option,
      }));

      const response = await fetch("http://localhost:3001/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await response.json();
      setScore(data.score);
      setShowAnswer(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      handleSubmit();
    } else {
      setShowAnswer(false);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <QuizContainer>
      {currentQuestion < questions.length ? (
        <>
          <QuestionContainer>
            <QuestionText>{`Question ${currentQuestion + 1}/${
              questions.length
            }`}</QuestionText>
            <QuestionText>{`Q. ${questions[currentQuestion].text}`}</QuestionText>
            {questions[currentQuestion].options.map((option) => (
              <OptionButton
                key={option}
                selected={selectedOptions[currentQuestion] === option}
                onClick={() => handleOptionChange(option)}
              >
                {option}
              </OptionButton>
            ))}
          </QuestionContainer>
          <AnswerContainer>
            {showAnswer && (
              <AnswerText>
                Correct answer: {questions[currentQuestion].correctAnswer}
              </AnswerText>
            )}
          </AnswerContainer>
          <SubmitButton onClick={handleNext}>
            {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
          </SubmitButton>
        </>
      ) : showAnswer ? (
        <div>
          <h2>Quiz Completed!</h2>
          <p>
            Your score: {score} out of {questions.length}
          </p>
          {/* You can add a button to restart the quiz or other options here */}
        </div>
      ) : (
        ""
      )}
    </QuizContainer>
  );
};

export default Quiz;
