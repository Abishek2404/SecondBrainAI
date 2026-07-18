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
      { $group: { _id: '$folder', count: { $sum: 1 }, mimeTypes: { $push: '$mimeType' } } }
    ]);
    
    const countMap = new Map(documentCounts.map(item => [item._id.toString(), { count: item.count, mimeTypes: item.mimeTypes }]));

    const foldersWithCounts = folders.map(folder => {
      const folderData = countMap.get(folder._id.toString()) || { count: 0, mimeTypes: [] };
      
      // Determine predominant type
      let predominantType = 'folder';
      if (folderData.mimeTypes.length > 0) {
        const typeCounts = folderData.mimeTypes.reduce((acc: any, type: string) => {
          let genericType = 'folder';
          if (type === 'application/pdf') genericType = 'pdf';
          else if (type.startsWith('image/')) genericType = 'image';
          else if (type === 'text/markdown' || type === 'text/plain') genericType = 'text';
          else if (type.includes('word') || type.includes('document')) genericType = 'document';
          else if (type.includes('excel') || type.includes('spreadsheet')) genericType = 'spreadsheet';
          
          acc[genericType] = (acc[genericType] || 0) + 1;
          return acc;
        }, {});
        
        let maxCount = 0;
        for (const [type, count] of Object.entries(typeCounts)) {
          if (count as number > maxCount) {
            maxCount = count as number;
            predominantType = type;
          }
        }
      }

      return {
        _id: folder._id,
        name: folder.name,
        color: (folder as any).color,
        createdAt: (folder as any).createdAt,
        files: folderData.count,
        folderType: predominantType
      };
    });

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
    const { name, color } = req.body;
    
    if (!name) {
      return next(new AppError('Please provide a folder name', 400));
    }

    const folder = await Folder.create({
      name,
      color: color || 'indigo',
      user: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: folder._id,
        name: folder.name,
        color: folder.color,
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

    folder = await Folder.findByIdAndUpdate(req.params.id, { 
      name: req.body.name,
      ...(req.body.color ? { color: req.body.color } : {})
    }, {
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
