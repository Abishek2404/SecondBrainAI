import { Request, Response, NextFunction } from 'express';
import { Folder } from '../models/Folder';
import { Document } from '../models/Document';
import { AppError } from '../middlewares/error';

// @desc    Get all folders for current user
// @route   GET /api/folders
export const getFolders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folders = await Folder.find({ user: req.user?._id }).sort('-createdAt');
    
    // Also get document counts for each folder
    const folderIds = folders.map(f => f._id);
    const documentCounts = await Document.aggregate([
      { $match: { folder: { $in: folderIds }, user: req.user?._id } },
      { $group: { _id: '$folder', count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map(documentCounts.map(item => [item._id.toString(), item.count]));

    const foldersWithCounts = folders.map(folder => ({
      _id: folder._id,
      name: folder.name,
      createdAt: (folder as any).createdAt,
      files: countMap.get(folder._id.toString()) || 0
    }));

    res.status(200).json({
      success: true,
      count: foldersWithCounts.length,
      data: foldersWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new folder
// @route   POST /api/folders
export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return next(new AppError('Please provide a folder name', 400));
    }

    const folder = await Folder.create({
      name,
      user: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: folder._id,
        name: folder.name,
        files: 0
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update folder
// @route   PUT /api/folders/:id
export const updateFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let folder = await Folder.findById(req.params.id);

    if (!folder) {
      return next(new AppError(`Folder not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns folder
    if (folder.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError(`User not authorized to update this folder`, 401));
    }

    folder = await Folder.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete folder
// @route   DELETE /api/folders/:id
export const deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return next(new AppError(`Folder not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns folder
    if (folder.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError(`User not authorized to delete this folder`, 401));
    }

    // Optionally: check if it has documents before deleting, or move documents to root
    await Document.updateMany({ folder: folder._id }, { $unset: { folder: "" } });
    
    await Folder.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
