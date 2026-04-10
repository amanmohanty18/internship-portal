const express = require('express');
const router = express.Router();
const fs = require('fs');
const Profile = require('../models/profile');
const Internship = require('../models/internship');
const auth = require('../middleware/auth');

// POST/UPDATE - Student creates or updates their profile
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create a profile' });
    }

    const { cgpa, graduationYear, branch, college, skills, bio } = req.body;

    if (!cgpa || !graduationYear || !branch || !college) {
      return res.status(400).json({ message: 'CGPA, graduation year, branch and college are required' });
    }

    const data = {
      cgpa: parseFloat(cgpa),
      graduationYear: parseInt(graduationYear),
      branch: branch.trim(),
      college: college.trim(),
      skills: Array.isArray(skills) ? skills : [],
      bio: bio || ''
    };

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      Object.assign(profile, data);
      await profile.save();
      return res.json({ message: 'Profile updated successfully', profile });
    }

    profile = new Profile({ user: req.user.id, ...data });
    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET - Get my profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'name email');

    if (!profile) {
      return res.json(null); // return null so frontend knows no profile yet
    }

    const profileObj = profile.toObject();
    if (profileObj.resumeUrl) {
      const filePath = '.' + profileObj.resumeUrl;
      if (!fs.existsSync(filePath)) profileObj.resumeUrl = null;
    }

    res.json(profileObj);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET - Skill gap for a specific internship
router.get('/skillgap/:internshipId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Please complete your profile first' });
    }

    const internship = await Internship.findById(req.params.internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (!internship.requiredSkills || internship.requiredSkills.length === 0) {
      return res.json({ internshipTitle: internship.title, matchPercentage: 100, matchedSkills: [], missingSkills: [], cgpaEligible: true, yearEligible: true, eligible: true });
    }

    const studentSkills = profile.skills.map(s => s.toLowerCase());
    const requiredSkills = internship.requiredSkills.map(s => s.toLowerCase());

    const matchedSkills = requiredSkills.filter(s => studentSkills.includes(s));
    const missingSkills = requiredSkills.filter(s => !studentSkills.includes(s));
    const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

    const cgpaEligible = profile.cgpa >= internship.minCGPA;
    const yearEligible = !internship.graduationYear || profile.graduationYear === internship.graduationYear;

    res.json({
      internshipTitle: internship.title,
      matchPercentage,
      matchedSkills,
      missingSkills,
      cgpaEligible,
      yearEligible,
      eligible: cgpaEligible && yearEligible && missingSkills.length === 0
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;