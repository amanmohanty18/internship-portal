const express = require('express');
const router = express.Router();
const Internship = require('../models/internship');
const auth = require('../middleware/auth');

// POST - Company posts an internship
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can post internships' });
    }

    const { title, location, duration, stipend, description, requiredSkills, minCGPA, graduationYear, openings } = req.body;

    if (!title || !location) {
      return res.status(400).json({ message: 'Title and location are required' });
    }

    const internship = new Internship({
      company: req.user.id,
      title: title.trim(),
      location: location.trim(),
      duration,
      stipend,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      minCGPA: minCGPA || 0,
      graduationYear,
      openings: openings || 1
    });

    await internship.save();
    res.status(201).json({ message: 'Internship posted successfully', internship });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET - Company's own internships
router.get('/mine', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can access this' });
    }
    const internships = await Internship.find({ company: req.user.id })
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET - Search internships
router.get('/', async (req, res) => {
  try {
    const { role, location, minStipend, graduationYear } = req.query;

    let filter = {};

    // 🔍 Smart Role Search (handles "front end" vs "frontend")
    if (role && role.trim() !== "") {
      const searchTerm = role.replace(/\s+/g, ".*");
      filter.title = { $regex: searchTerm, $options: "i" };
    }

    // 📍 Location filter
    if (location && location.trim() !== "") {
      filter.location = { $regex: location, $options: "i" };
    }

    // 💰 Stipend filter (works for numbers + includes unpaid when empty)
    if (minStipend && minStipend !== "") {
      filter.stipend = { $gte: Number(minStipend) };
    }

    // 🎓 Graduation year filter (skip if "All Years")
    if (graduationYear && graduationYear !== "All Years") {
      filter.graduationYear = Number(graduationYear);
    }

    const internships = await Internship.find(filter)
      .populate('company', 'name email isVerified')
      .sort({ createdAt: -1 });

    res.json(internships);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET - Single internship
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('company', 'name email isVerified');

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json(internship);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// DELETE - Company deletes internship
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can delete internships' });
    }

    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (internship.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own internships' });
    }

    await Internship.findByIdAndDelete(req.params.id);

    res.json({ message: 'Internship deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// POST - Student reports internship
router.post('/:id/report', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can report internships' });
    }

    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const alreadyReported = internship.reports.find(
      r => r.student.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'You already reported this internship' });
    }

    internship.reports.push({
      student: req.user.id,
      reason: req.body.reason
    });

    internship.reportCount = internship.reports.length;
    await internship.save();

    res.json({ message: 'Internship reported successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// PUT - Edit internship
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can edit internships' });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (internship.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own internships' });
    }

    // Prevent overwriting company field or reports
    const { company, reports, reportCount, ...safeUpdates } = req.body;

    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      safeUpdates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Internship updated successfully', internship: updated });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// PATCH - Admin dismiss reports
router.patch('/:id/dismiss', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { reports: [], reportCount: 0 },
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json({ message: 'Reports dismissed successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;