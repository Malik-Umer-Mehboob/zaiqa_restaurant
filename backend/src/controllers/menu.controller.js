const prisma = require('../config/db');
const cloudinary = require('../config/cloudinary');

const getAllMenu = async (req, res) => {
  try {
    const menu = await prisma.menuCategory.findMany({
      include: {
        items: {
          where: { available: true }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });
    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    console.error('Get all menu error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        reviews: true,
        category: true,
      }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Calculate average rating
    const reviews = item.reviews || [];
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
      : 0;

    res.status(200).json({ 
      success: true, 
      data: { ...item, averageRating: avgRating } 
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, displayOrder } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const category = await prisma.menuCategory.create({
      data: {
        name,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0
      }
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, categoryId, tags, available } = req.body;
    
    if (!name || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, price, and categoryId are required' });
    }

    let imageUrl = null;

    if (req.file) {
      // Upload to cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'zaiqa/menu' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        imageUrl,
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        available: available !== undefined ? (available === 'true' || available === true) : true
      }
    });

    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, tags, available } = req.body;

    const existingItem = await prisma.menuItem.findUnique({ where: { id } });
    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    let imageUrl = existingItem.imageUrl;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'zaiqa/menu' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: name || existingItem.name,
        description: description !== undefined ? description : existingItem.description,
        price: price ? parseFloat(price) : existingItem.price,
        categoryId: categoryId || existingItem.categoryId,
        imageUrl,
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : existingItem.tags,
        available: available !== undefined ? (available === 'true' || available === true) : existingItem.available
      }
    });

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    await prisma.menuItem.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { available: !item.available }
    });

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const category = await prisma.menuCategory.update({
      where: { id },
      data: { name }
    });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has items
    const itemsCount = await prisma.menuItem.count({
      where: { categoryId: id }
    });

    if (itemsCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category: it has menu items attached to it. Please delete or move the items first.' 
      });
    }

    await prisma.menuCategory.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllMenu,
  getMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
};
