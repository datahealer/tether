import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Loader, Upload } from 'lucide-react';
import { DashboardLayout } from '../components/layout/Dashboard_layout';
import { StatsCards } from '../components/ui/Stats';
import { Filters } from '../components/ui/Filter';
import { QuestionsTable } from '../components/ui/question/Quesion_table';
import { QuestionModal } from '../components/ui/question/QuestionModal';
import { ImportModal } from '../components/ui/ImportModal';
import { questionsService, Question } from '../services/question';
import { BarChart3, TrendingUp, Edit, Eye } from 'lucide-react';

import { Link } from '@tanstack/react-router';
export const Dashboard: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
const [viewQuestion, setViewQuestion] = useState<Question | null>(null);

  // New modal for upload
const [showImportModal, setShowImportModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedGenderFocus, setSelectedGenderFocus] = useState('All');
  const [sortBy, setSortBy] = useState<'createdAt' | 'question' | 'categoryId'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionsService.getAll();
      console.log('📋 Fetched questions:', data);
      setQuestions(data);
      setError('');
    } catch (err: any) {
      console.error('❌ Failed to fetch questions:', err);
      setError(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filtered and sorted questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions.filter((q) => {
      const matchesSearch = q.question?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || q.categoryId === selectedCategory;
      const matchesType =
        selectedType === 'All' ||
        (selectedType === 'Published' ? q.status === 'Published' : q.status === 'Draft');
      const matchesGender =
        selectedGenderFocus === 'All' || q.genderFocus === selectedGenderFocus;
      return matchesSearch && matchesCategory && matchesType && matchesGender;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'question') {
        comparison = a.question.localeCompare(b.question);
      } else {
        comparison = a.categoryId.localeCompare(b.categoryId);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    questions,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedGenderFocus,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: questions.length,
    published: questions.filter((q) => q.status === 'Published').length,
    draft: questions.filter((q) => q.status === 'Draft').length,
    totalViews: 0, // Backend doesn't have views yet
  };

  // Handlers
  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setShowModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const handleSaveQuestion = async (questionData: Partial<Question>) => {
    try {
      console.log('💾 Saving question:', questionData);
      
      if (selectedQuestion) {
        console.log('✏️ Updating existing question:', selectedQuestion._id);
        await questionsService.update(selectedQuestion._id, questionData);
      } else {
        console.log('➕ Creating new question');
        await questionsService.create(questionData);
      }
      
      console.log('✅ Question saved, refreshing list...');
      await fetchQuestions();
      setShowModal(false);
      setSelectedQuestion(null);
    } catch (err: any) {
      console.error('❌ Error saving question:', err);
      alert(err.response?.data?.message || 'Failed to save question');
      throw err; // Re-throw so the modal can handle it
    }
  };
const handleViewQuestion = (question: Question) => {
  setViewQuestion(question);
  setShowViewModal(true);
};

 const handleDeleteQuestion = (id: string) => {
  setDeleteQuestionId(id);
  setShowDeleteModal(true);
};
const confirmDeleteQuestion = async () => {
  if (!deleteQuestionId) return;

  try {
    await questionsService.delete(deleteQuestionId);
    await fetchQuestions();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete question');
  } finally {
    setShowDeleteModal(false);
    setDeleteQuestionId(null);
  }
};


  // const handleViewQuestion = (question: Question) => {
  //   alert(`Question: ${question.question}\n\nCategory: ${question.categoryId}\nGender Focus: ${question.genderFocus}\nDifficulty: ${question.difficulty}\nStatus: ${question.status}`);
  // };
  const handleImportSuccess = (count: number) => {
  alert(`Successfully imported ${count} questions!`);
  fetchQuestions(); // Refresh list
};

  const handleExport = () => {
    const csv = [
      ['Question', 'Category', 'Gender Focus', 'Status', 'Difficulty', 'Date Added'].join(','),
      ...filteredQuestions.map((q) =>
        [
          `"${q.question}"`,
          q.categoryId,
          q.genderFocus,
          q.status,
          q.difficulty,
          new Date(q.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.csv';
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-[#FF7E3D]" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start md:items-center flex-col md:flex-row gap-4 justify-between mb-12 border-b border-white/10 pb-6">
  <div className="flex flex-wrap gap-4">
    <Link
      to="/admin/dashboard"
      activeProps={{ className: 'text-[#FF7E3D] border-b-2 border-[#FF7E3D] pb-2' }}
      inactiveProps={{ className: 'text-[#1F2935]/70 hover:text-[#1F2935]' }}
      className="text-lg cursor-pointer font-semibold transition-colors border-[#1F2935] border rounded-xl p-3 text-[#1F2935]/70"
    >
      Questions
    </Link>
    <Link
      to="/admin/categories"
      activeProps={{ className: 'text-[#FF7E3D] border-b-2 border-[#FF7E3D] pb-2' }}
      inactiveProps={{ className: 'text-[#1F2935]/70 hover:text-[#1F2935]' }}
      className="text-lg cursor-pointer font-semibold transition-colors border-[#1F2935] border rounded-xl p-3 text-[#1F2935]/70"
    >
      Categories
    </Link>
    <Link
      to="/admin/users"
      activeProps={{ className: 'text-[#FF7E3D] border-b-2 border-[#FF7E3D] pb-2' }}
      inactiveProps={{ className: 'text-[#1F2935]/70 hover:text-[#1F2935]' }}
      className="text-lg cursor-pointer font-semibold transition-colors border-[#1F2935] border rounded-xl p-3 text-[#1F2935]/70"
    >
      Users
    </Link>
    <Link
      to="/admin/stats"
      activeProps={{ className: 'text-[#FF7E3D] border-b-2 border-[#FF7E3D] pb-2' }}
      inactiveProps={{ className: 'text-[#1F2935]/70 hover:text-[#1F2935]' }}
      className="text-lg cursor-pointer font-semibold transition-colors border-[#1F2935] border rounded-xl p-3 text-[#1F2935]/70"
    >
      Stats
    </Link>
    <Link
      to="/admin/unlocks"
      activeProps={{ className: 'text-[#FF7E3D] border-b-2 border-[#FF7E3D] pb-2' }}
      inactiveProps={{ className: 'text-[#1F2935]/70 hover:text-[#1F2935]' }}
      className="text-lg cursor-pointer font-semibold transition-colors border-[#1F2935] border rounded-xl p-3 text-[#1F2935]/70"
    >
      Unlocks
    </Link>
  </div>
   <button
          onClick={handleAddQuestion}
          className="flex items-center gap-2 bg-[#FF7E3D] text-white px-6 py-3 rounded-xl font-medium"
        >
          <Plus size={20} />
          Add Question
        </button>
        </div>
      <div className="flex flex-col items-start gap-4 md:items-center md:flex-row justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2935] mb-2">Question Dashboard</h1>
          <p className="text-[#626262]">Manage and analyze your question bank</p>
        </div>
       
       <button
  onClick={() => setShowImportModal(true)}
  className="flex items-center gap-2 bg-[#FF7E3D] text-white px-6 py-3 rounded-xl hover:bg-white/20 hover:border hover:border-[#FF7E3D] hover:text-[#FF7E3D] transition-all"
>
  <Upload size={20} />
  Import Excel
</button>
      </div>
      
     



      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

<StatsCards
  cards={[
    {
      label: 'Total Questions',
      value: stats.total,
      icon: <BarChart3 className="text-white" size={24} />,
      gradient: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/20',
    },
    {
      label: 'Published Questions',
      value: stats.published,
      icon: <TrendingUp className="text-white" size={24} />,
      gradient: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/30',
      bg: 'bg-green-500/20',
    },
    {
      label: 'Draft Questions',
      value: stats.draft,
      icon: <Edit className="text-white" size={24} />,
      gradient: 'from-orange-500/20 to-orange-600/20',
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/20',
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: <Eye className="text-white" size={24} />,
      gradient: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/20',
    },
  ]}
/>

      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedGenderFocus={selectedGenderFocus}
        setSelectedGenderFocus={setSelectedGenderFocus}
        sortBy={sortBy}
        setSortBy={(sort: string) => setSortBy(sort as 'createdAt' | 'question' | 'categoryId')}
        sortOrder={sortOrder}
        setSortOrder={(order: string) => setSortOrder(order as 'asc' | 'desc')}
        onExport={handleExport}
      />

      <QuestionsTable
         questions={paginatedQuestions}
  onEdit={handleEditQuestion}
  onDelete={handleDeleteQuestion}
  onView={handleViewQuestion}
      />

      {/* Pagination */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-white/10 rounded-2xl px-4 sm:px-6 py-4">
  
  {/* Info text */}
  <p className="text-[#626262] text-sm sm:text-base text-center sm:text-left">
    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
    {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of{" "}
    {filteredQuestions.length} questions
  </p>

  {/* Pagination buttons */}
  <div className="flex flex-wrap justify-center sm:justify-end gap-2">
    
    <button
      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      className="px-3 sm:px-4 py-2 text-sm sm:text-base
        bg-white/10 border border-[#FF7E3D] cursor-pointer rounded-lg text-[#1F2935]
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:bg-white/20 transition-all"
    >
      Prev
    </button>

    {[...Array(Math.min(5, totalPages))].map((_, i) => {
      const page = i + 1;
      return (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border-[#626262]  transition-all ${
            currentPage === page
              ? "bg-[#FF7E3D] text-white border border-[#FF7E3D]"
              : "bg-white/10 border border-[#626262]  text-[#1F2935] hover:bg-white/20"
          }`}
        >
          {page}
        </button>
      );
    })}

    <button
      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
      className="px-3 sm:px-4 py-2 text-sm sm:text-base
        bg-white/10 border border-[#FF7E3D] rounded-lg text-[#1F2935]
        disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed
        hover:bg-white/20 transition-all"
    >
      Next
    </button>

  </div>
</div>

      <QuestionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedQuestion(null);
        }}
        onSave={handleSaveQuestion}
        question={selectedQuestion}
      />
      <ImportModal
  isOpen={showImportModal}
  onClose={() => setShowImportModal(false)}
  onSuccess={handleImportSuccess}
/>
      {/* View Question Modal */}
{showViewModal && viewQuestion && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
      
      {/* Close */}
      <button
        onClick={() => setShowViewModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-2xl font-semibold text-[#1F2935] mb-6">
        Question Metadata
      </h2>

      <div className="space-y-6 text-[#1F2935]">
        {/* Question Text */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Question</p>
          <p className="font-medium text-lg bg-gray-50 p-4 rounded-xl">{viewQuestion.question}</p>
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Question ID</p>
            <p className="font-medium">{viewQuestion.questionId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <p className="font-medium">{viewQuestion.categoryId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Gender Focus</p>
            <p className="font-medium">{viewQuestion.genderFocus}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Tone</p>
            <p className="font-medium">{viewQuestion.tone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Difficulty</p>
            <p className="font-medium">{viewQuestion.difficulty}/5</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="font-medium">{viewQuestion.status}</p>
          </div>
        </div>

        {/* Relationship Stage */}
        {viewQuestion.relationshipStage && viewQuestion.relationshipStage.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Relationship Stage</p>
            <div className="flex flex-wrap gap-2">
              {viewQuestion.relationshipStage.map((stage: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  {stage}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Living Type */}
        {viewQuestion.livingType && viewQuestion.livingType.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Living Type</p>
            <div className="flex flex-wrap gap-2">
              {viewQuestion.livingType.map((type: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Goal Tags */}
        {viewQuestion.goalTag && viewQuestion.goalTag.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Goal Tags</p>
            <div className="flex flex-wrap gap-2">
              {viewQuestion.goalTag.map((goal: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Needs */}
        {viewQuestion.emotionalNeed && viewQuestion.emotionalNeed.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Emotional Needs</p>
            <div className="flex flex-wrap gap-2">
              {viewQuestion.emotionalNeed.map((need: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-sm">
                  {need}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Optional Fields */}
        {(viewQuestion.formatType || viewQuestion.contextTag) && (
          <div className="grid grid-cols-2 gap-4">
            {viewQuestion.formatType && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Format Type</p>
                <p className="font-medium">{viewQuestion.formatType}</p>
              </div>
            )}
            {viewQuestion.contextTag && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Context Tag</p>
                <p className="font-medium">{viewQuestion.contextTag}</p>
              </div>
            )}
          </div>
        )}

        {/* Writer Notes - Internal */}
        {viewQuestion.writerNotes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">Writer Notes (Internal)</p>
            <p className="text-[#1F2935] whitespace-pre-wrap">{viewQuestion.writerNotes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500 mb-1">Created At</p>
            <p className="font-medium text-sm">
              {new Date(viewQuestion.createdAt).toLocaleString()}
            </p>
          </div>
          {viewQuestion.updatedAt && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Updated At</p>
              <p className="font-medium text-sm">
                {new Date(viewQuestion.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={() => setShowViewModal(false)}
          className="px-6 py-2 cursor-pointer rounded-xl bg-[#FF7E3D] text-white font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">

      <h2 className="text-xl font-semibold text-[#1F2935] mb-4">
        Delete Question
      </h2>

      <p className="text-[#626262] mb-6">
        Are you sure you want to delete this question?  
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteQuestionId(null);
          }}
          className="px-5 py-2 rounded-xl border border-gray-300 text-[#1F2935]"
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleteQuestion}
          className="px-5 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </DashboardLayout>
  );
};