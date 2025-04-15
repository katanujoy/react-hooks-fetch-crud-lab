import React, { useState } from "react";

function QuestionForm({ onAddQuestion }) {
  const [formData, setFormData] = useState({
    prompt: "",
    answers: ["", "", "", ""],
    correctIndex: 0,
  });

  function handleChange(event) {
    const { name, value } = event.target;

    if (name.startsWith("answer")) {
      const index = parseInt(name.replace("answer", ""));
      const updatedAnswers = [...formData.answers];
      updatedAnswers[index] = value;
      setFormData({ ...formData, answers: updatedAnswers });
    } else {
      setFormData({
        ...formData,
        [name]: name === "correctIndex" ? parseInt(value) : value,
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Validate form data before submitting
    if (!formData.prompt || formData.answers.some(answer => answer === "")) {
      alert("Please fill out all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: formData.prompt,
          answers: formData.answers,
          correctIndex: formData.correctIndex
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const newQuestion = await response.json();
      onAddQuestion(newQuestion);

      // Reset form after successful submission
      setFormData({
        prompt: "",
        answers: ["", "", "", ""],
        correctIndex: 0,
      });
    } catch (error) {
      console.error("Error submitting question:", error);
    }
  }

  return (
    <section>
      <h1>New Question</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Prompt:
          <input
            type="text"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            required
          />
        </label>
        {formData.answers.map((answer, index) => (
          <label key={index}>
            Answer {index + 1}:
            <input
              type="text"
              name={`answer${index}`}
              value={answer}
              onChange={handleChange}
              required
            />
          </label>
        ))}
        <label>
          Correct Answer:
          <select
            name="correctIndex"
            value={formData.correctIndex}
            onChange={handleChange}
          >
            {formData.answers.map((_, index) => (
              <option key={index} value={index}>
                Answer {index + 1}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Submit Question</button>
      </form>
    </section>
  );
}

export default QuestionForm;