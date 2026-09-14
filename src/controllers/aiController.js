const aiService = require('../ai/aiService');

exports.classifyEmergency = async (req, res, next) => {
  try {
    const { description, evidenceMeta } = req.body;
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required for AI emergency classification'
      });
    }

    const triageResult = await aiService.classifyIncident(description, evidenceMeta);
    return res.json({
      success: true,
      data: triageResult
    });
  } catch (err) {
    next(err);
  }
};

exports.classifyEvidence = async (req, res, next) => {
  try {
    const { fileMeta } = req.body;
    const result = aiService.classifyEvidence(fileMeta);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};
