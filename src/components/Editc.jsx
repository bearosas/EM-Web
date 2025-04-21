import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase'; // Adjust the import path as needed
import { doc, updateDoc } from 'firebase/firestore';
import '../styles/contents.css'; // Reuse the same styles

// Predefined cover images (same as in Contents.jsx)
const materialCovers = [
  { id: 1, url: 'https://via.placeholder.com/80', name: 'Counting Stars' },
  { id: 2, url: 'https://via.placeholder.com/80', name: 'ABC Blocks' },
  { id: 3, url: 'https://via.placeholder.com/80', name: 'Happy Shapes' },
  { id: 4, url: 'https://via.placeholder.com/80', name: 'Cute Animals' },
  { id: 5, url: 'https://via.placeholder.com/80', name: 'Story Land' },
];

const assessmentCovers = [
  { id: 6, url: 'https://via.placeholder.com/80', name: 'Quiz Stars' },
  { id: 7, url: 'https://via.placeholder.com/80', name: 'Brain Games' },
  { id: 8, url: 'https://via.placeholder.com/80', name: 'Math Magic' },
  { id: 9, url: 'https://via.placeholder.com/80', name: 'Word Hunt' },
  { id: 10, url: 'https://via.placeholder.com/80', name: 'Fun Challenge' },
];

const EditContent = () => {
  const { id } = useParams(); // Get the content ID from the URL
  const location = useLocation();
  const navigate = useNavigate();
  const content = location.state?.content; // Get the content data passed via navigate

  // State for material editing
  const [materialTitle, setMaterialTitle] = useState(content?.type === 'material' ? content.title : '');
  const [selectedMaterialCover, setSelectedMaterialCover] = useState(
    content?.type === 'material'
      ? materialCovers.find((cover) => cover.url === content.imageUrl) || { url: content.imageUrl, name: 'Current Cover' }
      : null
  );

  // State for assessment editing
  const [assessmentTitle, setAssessmentTitle] = useState(content?.type === 'assessment' ? content.title : '');
  const [selectedAssessmentCover, setSelectedAssessmentCover] = useState(
    content?.type === 'assessment'
      ? assessmentCovers.find((cover) => cover.url === content.imageUrl) || { url: content.imageUrl, name: 'Current Cover' }
      : null
  );
  const [assessmentQuestions, setAssessmentQuestions] = useState(content?.type === 'assessment' ? content.questions : []);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple_choice',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false); // State for delete confirmation modal
  const [questionToDelete, setQuestionToDelete] = useState(null); // Track the question to delete
  const [notification, setNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); // State for error dialog

  useEffect(() => {
    if (!content) {
      console.error("No content data found for editing. ID:", id);
      navigate('/contents'); // Redirect back if no content data is found
    }
  }, [content, id, navigate]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  const showErrorDialog = (message) => {
    setErrorMessage(message);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText) {
      showErrorDialog('Please enter a question text.');
      return;
    }

    if (currentQuestion.type === 'multiple_choice') {
      if (currentQuestion.options.some(opt => !opt) || !currentQuestion.correctAnswer) {
        showErrorDialog('Please fill in all options and the correct answer.');
        return;
      }
      if (!currentQuestion.options.includes(currentQuestion.correctAnswer)) {
        showErrorDialog('The correct answer must match one of the options.');
        return;
      }
    }

    if (currentQuestion.type === 'fill_in_the_blank') {
      if (!currentQuestion.correctAnswer) {
        showErrorDialog('Please enter the correct answer.');
        return;
      }
    }

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...assessmentQuestions];
      updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
      setAssessmentQuestions(updatedQuestions);
      setEditingQuestionIndex(null);
      showNotification("Question updated");
    } else {
      setAssessmentQuestions([...assessmentQuestions, { ...currentQuestion }]);
      showNotification("Question added");
    }

    setCurrentQuestion({
      type: currentQuestion.type,
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
  };

  const handleClearQuestion = () => {
    setCurrentQuestion({
      type: currentQuestion.type,
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
    setEditingQuestionIndex(null);
    showNotification("Question cleared");
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = assessmentQuestions.filter((_, i) => i !== index);
    setAssessmentQuestions(updatedQuestions);
    setShowDeleteQuestionModal(false);
    setQuestionToDelete(null);
  };

  const confirmDeleteQuestion = (index) => {
    setQuestionToDelete(index);
    setShowDeleteQuestionModal(true);
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion({ ...assessmentQuestions[index] });
    setEditingQuestionIndex(index);
    setShowQuestionsModal(false);
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    if (!materialTitle || !selectedMaterialCover) {
      showErrorDialog('Please enter a material title and select a cover image.');
      return;
    }

    try {
      const materialRef = doc(db, 'materials', id);
      await updateDoc(materialRef, {
        title: materialTitle,
        imageUrl: selectedMaterialCover.url,
      });
      navigate('/contents'); // Redirect back to Contents page after saving
    } catch (error) {
      console.error("Error updating material:", error);
      showErrorDialog("Failed to update material. Please try again.");
    }
  };

  const handleUpdateAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentTitle || !selectedAssessmentCover || assessmentQuestions.length === 0) {
      showErrorDialog(assessmentQuestions.length === 0 ? 'The assessment cannot be empty.' : 'Please enter an assessment title, select a cover image, and add at least one question.');
      return;
    }

    try {
      const assessmentRef = doc(db, 'assessments', id);
      await updateDoc(assessmentRef, {
        title: assessmentTitle,
        imageUrl: selectedAssessmentCover.url,
        questions: assessmentQuestions,
      });
      navigate('/contents'); // Redirect back to Contents page after saving
    } catch (error) {
      console.error("Error updating assessment:", error);
      showErrorDialog("Failed to update assessment. Please try again.");
    }
  };

  return (
    <div className="container py-4">
      {/* Only show "Edit Material" heading for materials */}
      {content?.type === 'material' && <h1>Edit Material</h1>}

      {/* Material Edit Form */}
      {content?.type === 'material' && (
        <form className="material-form" onSubmit={handleUpdateMaterial}>
          <h2 className="form-heading">Edit Learning Material</h2>
          <div className="form-section">
            <label htmlFor="materialTitleInput" className="form-label">Material Title</label>
            <input
              type="text"
              className="form-control topic-input"
              id="materialTitleInput"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="e.g., Introduction to Numbers"
            />
          </div>
          <div className="form-section">
            <label className="form-label">Select Cover Image</label>
            <div className="cover-image-selection">
              {/* Display the current cover as an option */}
              <div
                className={`cover-image-option ${selectedMaterialCover?.url === content.imageUrl ? 'selected' : ''}`}
                onClick={() => setSelectedMaterialCover({ url: content.imageUrl, name: 'Current Cover' })}
              >
                <img src={content.imageUrl} alt="Current Cover" />
                <p>Current Cover</p>
              </div>
              {materialCovers.map((cover) => (
                <div
                  key={cover.id}
                  className={`cover-image-option ${selectedMaterialCover?.id === cover.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMaterialCover(cover)}
                >
                  <img src={cover.url} alt={cover.name} />
                  <p>{cover.name}</p>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="submit-btn">Update Material</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/contents')}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Assessment Edit Form */}
      {content?.type === 'assessment' && (
        <div className="assessment-form-wrapper">
          <div className="main-content">
            <form className="assessment-form" onSubmit={handleUpdateAssessment}>
              <h2 className="form-heading">Edit Quiz</h2>
              <div className="form-section">
                <label htmlFor="assessmentTitleInput" className="form-label">Quiz Title</label>
                <input
                  type="text"
                  className="form-control assessment-title-input"
                  id="assessmentTitleInput"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  placeholder="e.g., Number Recognition Quiz"
                />
              </div>
              <div className="form-section">
                <label className="form-label">Select Cover Image</label>
                <div className="cover-image-selection">
                  {/* Display the current cover as an option */}
                  <div
                    className={`cover-image-option ${selectedAssessmentCover?.url === content.imageUrl ? 'selected' : ''}`}
                    onClick={() => setSelectedAssessmentCover({ url: content.imageUrl, name: 'Current Cover' })}
                  >
                    <img src={content.imageUrl} alt="Current Cover" />
                    <p>Current Cover</p>
                  </div>
                  {assessmentCovers.map((cover) => (
                    <div
                      key={cover.id}
                      className={`cover-image-option ${selectedAssessmentCover?.id === cover.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAssessmentCover(cover)}
                    >
                      <img src={cover.url} alt={cover.name} />
                      <p>{cover.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="question-editor">
                <div className="question-inputs">
                  <h3>Add/Edit Question</h3>
                  <div className="form-section">
                    <label className="form-label">Question Type</label>
                    <select
                      value={currentQuestion.type}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          type: e.target.value,
                          options: ['', '', '', ''],
                          correctAnswer: '',
                        })
                      }
                      className="form-select"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="fill_in_the_blank">Fill in the Blank</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Type question here"
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                    className="question-text-input"
                  />

                  {currentQuestion.type === 'multiple_choice' && (
                    <>
                      <div className="options-container">
                        {currentQuestion.options.map((option, index) => (
                          <input
                            key={index}
                            type="text"
                            placeholder={`Type answer option here`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[index] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOptions });
                            }}
                            className="option-input"
                          />
                        ))}
                      </div>
                      <div className="correct-answer-section">
                        <label className="form-label">Correct Answer</label>
                        <select
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          className="form-select"
                        >
                          <option value="">Select correct answer</option>
                          {currentQuestion.options.map((option, index) => (
                            <option key={index} value={option} disabled={!option}>
                              {option || `Option ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {currentQuestion.type === 'fill_in_the_blank' && (
                    <>
                      <label className="form-label">Correct Answer</label>
                      <input
                        type="text"
                        placeholder="Type answer here"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                        className="correct-answer-input"
                      />
                    </>
                  )}
                  <div className="question-actions">
                    <button type="button" className="check-btn" onClick={handleAddQuestion}>
                      ✔
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClearQuestion}>
                      ✖
                    </button>
                  </div>
                </div>

                <div className="question-preview">
                  <h4>Preview:</h4>
                  <div className="preview-box">
                    <p>{currentQuestion.questionText || 'Type question here'}</p>
                    {currentQuestion.type === 'multiple_choice' && (
                      <div className="preview-options">
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className={`preview-option ${option === currentQuestion.correctAnswer ? 'correct' : ''}`}
                          >
                            {option || 'Type answer option here'}
                          </div>
                        ))}
                      </div>
                    )}
                    {currentQuestion.type === 'fill_in_the_blank' && (
                      <div className="fill-in-the-blank-preview">
                        <p>Type your answer in the boxes</p>
                        <input type="text" placeholder="Student will type here" disabled />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="questions-btn"
                  onClick={() => setShowQuestionsModal(true)}
                >
                  Questions
                </button>
                <button type="submit" className="submit-quiz-btn">
                  Update Quiz
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate('/contents')}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Pop-up */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      {/* Questions Modal (for assessments) */}
      {showQuestionsModal && content?.type === 'assessment' && (
        <div className="questions-modal">
          <div className="modal-content">
            <h3>Questions in this Quiz</h3>
            <button className="close-modal" onClick={() => setShowQuestionsModal(false)}>×</button>
            {assessmentQuestions.length > 0 ? (
              <ul className="questions-list">
                {assessmentQuestions.map((q, index) => (
                  <li key={index} className="question-item">
                    <div>
                      <strong>{q.questionText}</strong> ({q.type.replace('_', ' ')})
                    </div>
                    <div className="question-actions">
                      <button className="edit-btn" onClick={() => handleEditQuestion(index)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => confirmDeleteQuestion(index)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No questions added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Question Confirmation Modal */}
      {showDeleteQuestionModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this question: "<strong>{assessmentQuestions[questionToDelete]?.questionText}</strong>"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="modal-btn confirm-btn"
                onClick={() => handleDeleteQuestion(questionToDelete)}
              >
                Yes
              </button>
              <button
                className="modal-btn cancel-btn"
                onClick={() => {
                  setShowDeleteQuestionModal(false);
                  setQuestionToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {errorMessage && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <div className="modal-actions">
              <button
                className="modal-btn confirm-btn"
                onClick={() => setErrorMessage(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditContent;