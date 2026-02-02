import { authenticatedFetch } from './auth_service';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ExportedAnswer {
  questionId: string;
  questionText: string;
  category: string;
  completedDate: string;
  partner1: {
    name: string;
    answer: string;
    answeredAt: string;
  };
  partner2: {
    name: string;
    answer: string;
    answeredAt: string;
  };
}

export interface DeletableAnswer {
  id: string;
  questionId: string;
  question: string;
  category: string;
  date: string;
  completedAt: string;
}

/**
 * Export user data - generates file with all completed tethers
 */
export const exportUserData = async (): Promise<void> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/settings/privacy/export`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to export data');
    }

    const result = await response.json();
    
    // Convert to CSV format
    const csvContent = convertToCSV(result.data);
    
    // Save to file using new expo-file-system API
    const fileName = `tether-data-export-${new Date().toISOString().split('T')[0]}.csv`;
    const file = new File(Paths.cache, fileName);
    
    await file.write(csvContent);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Tether Data',
        UTI: 'public.comma-separated-values-text',
      });
    }

    return;
  } catch (error) {
    console.error('Export data error:', error);
    throw error;
  }
};

/**
 * Get list of deletable answers
 */
export const getDeletableAnswers = async (): Promise<DeletableAnswer[]> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/settings/privacy/deletable-answers`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get deletable answers');
    }

    const result = await response.json();
    return result.answers || [];
  } catch (error) {
    console.error('Get deletable answers error:', error);
    throw error;
  }
};

/**
 * Delete specific answers
 */
export const deleteSpecificAnswers = async (questionStateIds: string[]): Promise<number> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/settings/privacy/delete-answers`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionStateIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete answers');
    }

    const result = await response.json();
    return result.deletedCount || 0;
  } catch (error) {
    console.error('Delete specific answers error:', error);
    throw error;
  }
};

/**
 * Delete user account permanently
 */
export const deleteAccount = async (): Promise<void> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/settings/privacy/delete-account`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete account');
    }

    return;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

/**
 * Helper function to convert export data to CSV format
 */
function convertToCSV(data: ExportedAnswer[]): string {
  if (!data || data.length === 0) {
    return 'No data to export';
  }

  // CSV Headers
  const headers = [
    'Question ID',
    'Question',
    'Category',
    'Completed Date',
    'Partner 1 Name',
    'Partner 1 Answer',
    'Partner 1 Answered At',
    'Partner 2 Name',
    'Partner 2 Answer',
    'Partner 2 Answered At',
  ];

  // CSV Rows
  const rows = data.map((item) => [
    item.questionId,
    `"${item.questionText.replace(/"/g, '""')}"`, // Escape quotes
    item.category,
    new Date(item.completedDate).toLocaleDateString(),
    item.partner1.name,
    `"${item.partner1.answer.replace(/"/g, '""')}"`,
    new Date(item.partner1.answeredAt).toLocaleString(),
    item.partner2.name,
    `"${item.partner2.answer.replace(/"/g, '""')}"`,
    new Date(item.partner2.answeredAt).toLocaleString(),
  ]);

  // Combine headers and rows
  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))];

  return csvLines.join('\n');
}
