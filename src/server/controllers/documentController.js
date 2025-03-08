const Document = require('../models/Document');

exports.uploadDocument = async (req, res) => {
  try {
    const newDocument = new Document({
      userId: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      status: 'pending',
      uploadDate: new Date()
    });

    await newDocument.save();

    res.json({
      success: true,
      documentId: newDocument._id,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id });
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};