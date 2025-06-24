// 1. 게스트 로그인 저장 및 서버에 전송
export async function saveGuestNickname(nickname) {
  const guestToken = `guest-${Date.now()}`;
  
  // 로컬에도 저장
  localStorage.setItem('nickname', nickname);
  localStorage.setItem('guestToken', guestToken);

  // 서버에 전송
  const response = await fetch('/api/guest-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nickname, guestToken })
  });

  if (!response.ok) {
    throw new Error('게스트 로그인 실패');
  }

  const data = await response.json();
  return data;
}

// 2. 구글 로그인
export async function loginWithGoogle() {
  window.location.href = '/auth/google'; // OAuth 연동 백엔드 엔드포인트
}

// 3. 카카오 로그인
export async function loginWithKakao() {
  window.location.href = '/auth/kakao';
}

// 4. 네이버 로그인
export async function loginWithNaver() {
  window.location.href = '/auth/naver';
}


//테스트 용 함수 급하게 추가 버전 오류 있을 시 다른 auth 버전으로 대체 가능 