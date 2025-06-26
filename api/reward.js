const rewardData = require('../data/reward.json');

export default function handler(req, res) {
  const { name, unit } = req.query;

  if (!name || !unit) {
    return res.status(400).json({ error: '缺少 name 或 unit 参数' });
  }

  const reward = rewardData[name]?.[unit];

  if (!reward) {
    return res.status(200).json({ reward: '无（未配置）' });
  }

  return res.status(200).json({ reward });
}

