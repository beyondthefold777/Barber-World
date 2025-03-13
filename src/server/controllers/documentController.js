const Document = require('../models/Document');

exports.createDocument = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    
    const newDocument = new Document({
      barbershopId: req.user.userId,
      fileName: req.body.fileName,
      originalName: req.body.originalName,
      category: req.body.category,
      status: req.body.status
    });

    console.log('Attempting to save document:', newDocument);
    const savedDocument = await newDocument.save();
    console.log('Saved document:', savedDocument);

    res.json({
      success: true,
      document: savedDocument,
      message: 'Document recorded successfully'
    });
  } catch (error) {
    console.log('Error saving document:', error);
    res.status(500).json({ success: false, message: 'Failed to record document' });
  }
};

exports.getBarbershopDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ barbershopId: req.user.userId });
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, barbershopId: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update document' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      barbershopId: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};