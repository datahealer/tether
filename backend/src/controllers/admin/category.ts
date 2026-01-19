import { Request, Response } from 'express';
import { Category } from '../../models/Category';
import { CategoryId } from '../../types/enums';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // Optimized: Use lean() for read-only query
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ categories });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Optimized: Use lean() for read-only query
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.status(200).json(category);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, colorCode, description } = req.body;
    if (!name || !colorCode) {
      res.status(400).json({ message: 'Name and colorCode required' });
      return;
    }

    // Generate unique categoryId (e.g., uppercase name with ID)
    const categoryId = name.toUpperCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);

    const newCategory = new Category({
      categoryId,
      name,
      totalQuestions: 0,
      colorCode,
      description,
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.status(200).json(category);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    // TODO: Cascade delete questions or handle states
    res.status(200).json({ message: 'Category deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};