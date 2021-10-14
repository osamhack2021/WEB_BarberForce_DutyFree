const router = require('express').Router();

const Review = require('../models/review');

const fetchUser = require('../middleware/fetchUser');

// 해당 미용실의 리뷰 목록 가져오기
// (async/await)
router.get('/barbers/:id/reviews', async (req, res) => {
  const reviews = await Review.find({ barbers_id: req.params.id });

  return res.json({
    reviews: reviews,
  });
});

// 해당 미용실에 리뷰 작성하기
// (async/await)
router.post('/barbers/:id/reviews', fetchUser, async (req, res) => {
  const user = req.user;

  const created = await Review.create({
    barbers_id: req.params.id,
    thumb: '',
    reviewer: user.name,
    body: req.body.body,
    rating: req.body.rating,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    mss: '추가',
    created: created,
  });
});

module.exports = router;
