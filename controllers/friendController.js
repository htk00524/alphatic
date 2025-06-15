const { Friend, User } = require('../models'); // Sequelize 모델 임포트

// 친구 요청 보내기
exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    if (userId === targetId) {
      return res.status(400).json({ message: "자기 자신에게는 요청할 수 없습니다." });
    }

    // 이미 친구 요청/친구/차단 상태인지 확인
    const existing = await Friend.findOne({
      where: {
        user_id: userId,
        friend_id: targetId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: `이미 상태가 '${existing.status}'인 관계입니다.` });
    }

    // 친구 요청 생성
    await Friend.create({
      user_id: userId,
      friend_id: targetId,
      status: 'requesting',
    });

    res.status(201).json({ message: '친구 요청이 전송되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 친구 요청 수락
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId, requesterId } = req.body;

    const request = await Friend.findOne({
      where: {
        user_id: requesterId,
        friend_id: userId,
        status: 'requesting',
      },
    });

    if (!request) {
      return res.status(404).json({ message: '친구 요청이 존재하지 않습니다.' });
    }

    // 상태 변경 (친구)
    await request.update({ status: 'friend' });

    // 상대방도 친구 상태 추가 (상호 친구)
    await Friend.create({
      user_id: userId,
      friend_id: requesterId,
      status: 'friend',
    });

    res.status(200).json({ message: '친구 요청이 수락되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 친구 차단하기
exports.blockFriend = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    // 기존 관계가 있는지 확인
    let relation = await Friend.findOne({
      where: {
        user_id: userId,
        friend_id: targetId,
      },
    });

    if (relation) {
      // 상태 차단으로 업데이트
      await relation.update({ status: 'blocked' });
    } else {
      // 새로 차단 상태 생성
      await Friend.create({
        user_id: userId,
        friend_id: targetId,
        status: 'blocked',
      });
    }

    res.status(200).json({ message: '차단되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};
