import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/contents.css';

// Predefined cover images
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

const Contents = () => {
  const navigate = useNavigate();

  // State for content data
  const [materials, setMaterials] = useState([]);
  const [assessments, setAssessments] = useState([]);

  // State for filtering and sorting
  const [filter, setFilter] = useState('All'); // 'All', 'Materials', 'Assessments'
  const [sortOrder, setSortOrder] = useState('Newest'); // 'Newest', 'Oldest'

  // State for material form
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [selectedMaterialCover, setSelectedMaterialCover] = useState(null);
  const [materialFile, setMaterialFile] = useState(null); // State for file upload

  // State for assessment form
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [selectedAssessmentCover, setSelectedAssessmentCover] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple_choice',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);

  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State for form exit confirmation
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingFormAction, setPendingFormAction] = useState(null); // Store the action to take after confirmation

  // State for notification
  const [notification, setNotification] = useState(null);

  // Fetch materials and assessments from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch materials
        const materialsSnapshot = await getDocs(collection(db, 'materials'));
        const materialsData = materialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'material',
        }));
        setMaterials(materialsData);

        // Fetch assessments
        const assessmentsSnapshot = await getDocs(collection(db, 'assessments'));
        const assessmentsData = assessmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'assessment',
        }));
        setAssessments(assessmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  // Check if material form has unsaved changes
  const hasMaterialChanges = () => {
    return materialTitle || selectedMaterialCover || materialFile;
  };

  // Check if assessment form has unsaved changes
  const hasAssessmentChanges = () => {
    return (
      assessmentTitle ||
      selectedAssessmentCover ||
      assessmentQuestions.length > 0 ||
      currentQuestion.questionText ||
      currentQuestion.options.some(opt => opt) ||
      currentQuestion.correctAnswer
    );
  };

  // Handle toggling forms with confirmation for unsaved changes
  const toggleMaterialForm = () => {
    if (showAssessmentForm && hasAssessmentChanges()) {
      setPendingFormAction(() => () => {
        setShowAssessmentForm(false);
        resetAssessmentForm();
        setShowMaterialForm(true);
      });
      setShowExitModal(true);
    } else {
      setShowAssessmentForm(false);
      resetAssessmentForm();
      setShowMaterialForm(true);
    }
  };

  const toggleAssessmentForm = () => {
    if (showMaterialForm && hasMaterialChanges()) {
      setPendingFormAction(() => () => {
        setShowMaterialForm(false);
        resetMaterialForm();
        setShowAssessmentForm(true);
      });
      setShowExitModal(true);
    } else {
      setShowMaterialForm(false);
      resetMaterialForm();
      setShowAssessmentForm(true);
    }
  };

  const confirmExit = () => {
    if (pendingFormAction) {
      pendingFormAction();
      setPendingFormAction(null);
    }
    setShowExitModal(false);
  };

  const cancelExit = () => {
    setPendingFormAction(null);
    setShowExitModal(false);
  };

  const resetMaterialForm = () => {
    setMaterialTitle('');
    setSelectedMaterialCover(null);
    setMaterialFile(null);
  };

  const resetAssessmentForm = () => {
    setAssessmentTitle('');
    setSelectedAssessmentCover(null);
    setAssessmentQuestions([]);
    setCurrentQuestion({
      type: 'multiple_choice',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
    setEditingQuestionIndex(null);
  };

  // Combine and filter content
  const allContent = [...materials, ...assessments];
  const filteredContent = allContent.filter(item => {
    if (filter === 'Materials') return item.type === 'material';
    if (filter === 'Assessments') return item.type === 'assessment';
    return true; // 'All'
  });

  // Sort content by date added
  const sortedContent = [...filteredContent].sort((a, b) => {
    const dateA = a.createdAt?.toDate() || new Date();
    const dateB = b.createdAt?.toDate() || new Date();
    return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
  });

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialTitle || !selectedMaterialCover || !materialFile) {
      alert('Please enter a material title, select a cover image, and upload a file.');
      return;
    }

    try {
      // Upload the file to Firebase Storage
      const fileRef = ref(storage, `materials/${materialFile.name}`);
      await uploadBytes(fileRef, materialFile);
      const fileUrl = await getDownloadURL(fileRef);

      // Add material to Firestore with the file URL
      await addDoc(collection(db, 'materials'), {
        title: materialTitle,
        imageUrl: selectedMaterialCover.url,
        fileUrl: fileUrl,
        createdAt: serverTimestamp(),
      });

      resetMaterialForm();
      setShowMaterialForm(false);

      // Refresh materials
      const materialsSnapshot = await getDocs(collection(db, 'materials'));
      const materialsData = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'material',
      }));
      setMaterials(materialsData);

      showNotification("Material added successfully");
    } catch (error) {
      console.error("Error adding material:", error);
      alert("Failed to add material. Please try again.");
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText) {
      alert('Please enter a question text.');
      return;
    }

    if (currentQuestion.type === 'multiple_choice') {
      if (currentQuestion.options.some(opt => !opt) || !currentQuestion.correctAnswer) {
        alert('Please fill in all options and the correct answer.');
        return;
      }
      if (!currentQuestion.options.includes(currentQuestion.correctAnswer)) {
        alert('The correct answer must match one of the options.');
        return;
      }
    }

    if (currentQuestion.type === 'fill_in_the_blank') {
      if (!currentQuestion.correctAnswer) {
        alert('Please enter the correct answer.');
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
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion({ ...assessmentQuestions[index] });
    setEditingQuestionIndex(index);
    setShowQuestionsModal(false);
  };

  const handleAddAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentTitle || !selectedAssessmentCover || assessmentQuestions.length === 0) {
      alert('Please enter an assessment title, select a cover image, and add at least one question.');
      return;
    }

    try {
      await addDoc(collection(db, 'assessments'), {
        title: assessmentTitle,
        imageUrl: selectedAssessmentCover.url,
        questions: assessmentQuestions,
        createdAt: serverTimestamp(),
      });

      resetAssessmentForm();
      setShowAssessmentForm(false);

      // Refresh assessments
      const assessmentsSnapshot = await getDocs(collection(db, 'assessments'));
      const assessmentsData = assessmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'assessment',
      }));
      setAssessments(assessmentsData);

      showNotification("Assessment added successfully");
    } catch (error) {
      console.error("Error adding assessment:", error);
      alert("Failed to add assessment. Please try again.");
    }
  };

  const handleDeleteContent = async () => {
    try {
      const { id, type } = itemToDelete;
      await deleteDoc(doc(db, type === 'material' ? 'materials' : 'assessments', id));

      if (type === 'material') {
        setMaterials(materials.filter(item => item.id !== id));
      } else {
        setAssessments(assessments.filter(item => item.id !== id));
      }

      setShowDeleteModal(false);
      setItemToDelete(null);
      showNotification(`${type === 'material' ? 'Material' : 'Assessment'} deleted successfully`);
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content. Please try again.");
    }
  };

  const handleEditContent = (item) => {
    navigate(`/edit-content/${item.id}`, { state: { content: item } });
  };

  return (
    <div className="container py-4">
      {/* Buttons for adding content and filtering */}
      <div className="button-container mb-4">
        <div className="add-buttons">
          <button
            className="cl-btn-add-material me-2"
            onClick={toggleMaterialForm}
          >
            <span className="add-icon">+</span> Add Material
          </button>
          <button
            className="cl-btn-add-assessment me-2"
            onClick={toggleAssessmentForm}
          >
            <span className="add-icon">+</span> Add Assessment
          </button>
        </div>
        <div className="filter-buttons">
          <button
            className={`cl-btn-filter me-2 ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All
          </button>
          <button
            className={`cl-btn-filter me-2 ${filter === 'Materials' ? 'active' : ''}`}
            onClick={() => setFilter('Materials')}
          >
            Materials
          </button>
          <button
            className={`cl-btn-filter me-2 ${filter === 'Assessments' ? 'active' : ''}`}
            onClick={() => setFilter('Assessments')}
          >
            Assessments
          </button>
          <button
            className={`cl-btn-filter ${sortOrder === 'Newest' ? 'active' : ''}`}
            onClick={() => setSortOrder(sortOrder === 'Newest' ? 'Oldest' : 'Newest')}
          >
            {sortOrder === 'Newest' ? 'Sort: Newest' : 'Sort: Oldest'}
          </button>
        </div>
      </div>

      {/* Material Form */}
      {showMaterialForm && (
        <form className="material-form" onSubmit={handleAddMaterial}>
          <h2 className="form-heading">Add Learning Material</h2>
          <div className="form-section">
            <label htmlFor="materialTitleInput" className="form-label">Material Title</label>
            <input
              type="text"
              className="topic-input"
              id="materialTitleInput"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="e.g., Introduction to Numbers"
            />
          </div>
          <div className="form-section">
            <label htmlFor="materialFileInput" className="form-label">Upload File (PDF, PPTX, DOCS)</label>
            <input
              type="file"
              className="form-control"
              id="materialFileInput"
              accept=".pdf,.pptx,.doc,.docx"
              onChange={(e) => setMaterialFile(e.target.files[0])}
            />
          </div>
          <div className="form-section">
            <label className="form-label">Select Cover Image</label>
            <div className="cover-image-selection">
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
          <button type="submit" className="submit-btn">Add Material</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              if (hasMaterialChanges()) {
                setPendingFormAction(() => () => {
                  setShowMaterialForm(false);
                  resetMaterialForm();
                });
                setShowExitModal(true);
              } else {
                setShowMaterialForm(false);
                resetMaterialForm();
              }
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Assessment Form */}
      {showAssessmentForm && (
        <div className="assessment-form-wrapper">
          <div className="main-content">
            <form className="assessment-form" onSubmit={handleAddAssessment}>
              <h2 className="form-heading">Add Quiz</h2>
              <div className="form-section">
                <label htmlFor="assessmentTitleInput" className="form-label">Quiz Title</label>
                <input
                  type="text"
                  className="assessment-title-input"
                  id="assessmentTitleInput"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  placeholder="e.g., Number Recognition Quiz"
                />
              </div>
              <div className="form-section">
                <label className="form-label">Select Cover Image</label>
                <div className="cover-image-selection">
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
                  <h3>Add Question</h3>
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
                  Add Quiz
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    if (hasAssessmentChanges()) {
                      setPendingFormAction(() => () => {
                        setShowAssessmentForm(false);
                        resetAssessmentForm();
                      });
                      setShowExitModal(true);
                    } else {
                      setShowAssessmentForm(false);
                      resetAssessmentForm();
                    }
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Grid - Only show when forms are closed */}
      {!showMaterialForm && !showAssessmentForm && (
        <div className="content-grid">
          {sortedContent.map((item) => (
            <div key={item.id} className="cl-content-card">
              <div className="cl-content-image-wrapper">
                <img src={item.imageUrl} alt={item.title} className="cl-content-img" />
              </div>
              <div className="cl-content-body">
                <h5 className="cl-content-title">{item.title}</h5>
                <p className="cl-content-type">{item.type}</p>
                {item.type === 'material' && item.fileUrl && (
                  <p className="cl-content-info">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">View File</a>
                  </p>
                )}
                {item.type === 'assessment' && (
                  <p className="cl-content-info">{item.questions.length} questions</p>
                )}
              </div>
              <div className="cl-content-actions">
                <button
                  className="cl-btn-edit"
                  onClick={() => handleEditContent(item)}
                >
                  Edit
                </button>
                <button
                  className="cl-btn-delete"
                  onClick={() => {
                    setItemToDelete(item);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "<strong>{itemToDelete.title}</strong>"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-btn confirm-btn" onClick={handleDeleteContent}>
                Yes
              </button>
              <button
                className="modal-btn cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Unsaved Changes</h3>
            <p>You haven't saved this. Are you sure you want to exit?</p>
            <div className="modal-actions">
              <button className="modal-btn confirm-btn" onClick={confirmExit}>
                Yes
              </button>
              <button className="modal-btn cancel-btn" onClick={cancelExit}>
                No
              </button>
            </div>
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
      {showQuestionsModal && (
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
                      <button className="delete-btn" onClick={() => handleDeleteQuestion(index)}>
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
    </div>
  );
};

export default Contents;