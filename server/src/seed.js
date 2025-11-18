// server/src/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path'); // 'path' 모듈 추가
const User = require('./models/user.model');
const Caravan = require('./models/caravan.model');

// .env 파일의 경로를 명시적으로 지정합니다.
// __dirname은 현재 실행 중인 파일(seed.js)이 위치한 디렉토리(server/src)를 가리킵니다.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedCaravans = async () => {
    try {
        // 1. 데이터베이스 연결
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // 2. 호스트로 사용할 사용자 찾기
        // 데이터베이스에 사용자가 최소 1명 이상 존재해야 합니다.
        const hostUser = await User.findOne();
        if (!hostUser) {
            console.error('Error: No users found in the database. Please create a user first.');
            return; // 사용자가 없으면 스크립트 종료
        }
        console.log(`Found host user: ${hostUser.displayName} (${hostUser.email})`);

        // 3. 기존 카라반 데이터 삭제
        await Caravan.deleteMany({});
        console.log('Existing caravans deleted.');

        // 4. 10개의 샘플 카라반 데이터 생성
        const sampleCaravans = [
            {
                host: hostUser._id,
                name: '감성 가득 모던 카라반',
                description: '서울 근교에서 즐기는 힐링 캠핑. 최신 시설 완비!',
                capacity: 4,
                dailyRate: 150000,
                location: '경기도 가평군',
                amenities: ['샤워', '주방', '에어컨', '난방', 'TV'],
                photos: ['https://placehold.co/400x300/A9A9A9/FFFFFF?text=Modern+Caravan'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '제주 바다 앞 오션뷰 카라반',
                description: '애월 해안도로에 위치한 환상적인 뷰의 카라반입니다. 파도 소리를 들으며 잠드세요.',
                capacity: 2,
                dailyRate: 220000,
                location: '제주특별자치도 제주시 애월읍',
                amenities: ['샤워', '주방', '오션뷰', '테라스'],
                photos: ['https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA5fDB8MXxjb2xsZWN0aW9ufDF8fDE2MjM4NjV8fHx8fDJ8fDE2MjM4NjU&ixlib=rb-1.2.1&q=80&w=400'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '강원도 숲속의 힐링 스테이',
                description: '피톤치드 가득한 강원도 숲 속에서 재충전의 시간을 가져보세요.',
                capacity: 3,
                dailyRate: 180000,
                location: '강원도 평창군',
                amenities: ['난방', '바베큐 그릴', '숲속 뷰'],
                photos: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA5fDB8MXxjb2xsZWN0aW9ufDF8fDE2MjM4NjV8fHx8fDJ8fDE2MjM4NjU&ixlib=rb-1.2.1&q=80&w=400'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '가족과 함께하는 대형 카라반',
                description: '6인 가족도 넉넉한 넓은 실내 공간. 아이들과 잊지 못할 추억을 만드세요.',
                capacity: 6,
                dailyRate: 250000,
                location: '충청남도 태안군',
                amenities: ['샤워', '주방', '에어컨', '난방', 'TV', '대형 침대'],
                photos: ['https://images.unsplash.com/photo-1503614472-8c93d56e92ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA5fDB8MXxjb2xsZWN0aW9ufDF8fDE2MjM4NjV8fHx8fDJ8fDE2MjM4NjU&ixlib=rb-1.2.1&q=80&w=400'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '레트로 감성 빈티지 카라반',
                description: '독특한 디자인의 빈티지 카라반에서 특별한 사진을 남겨보세요.',
                capacity: 2,
                dailyRate: 130000,
                location: '경기도 파주시',
                amenities: ['주방', '난방', '레트로 소품'],
                photos: ['https://placehold.co/400x300/D2B48C/FFFFFF?text=Retro+Caravan'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '부산 해운대 시티뷰 카라반',
                description: '해운대 해수욕장과 가까운 도심 속 캠핑. 편리함과 낭만을 동시에!',
                capacity: 4,
                dailyRate: 190000,
                location: '부산광역시 해운대구',
                amenities: ['샤워', '주방', '에어컨', '시티뷰'],
                photos: ['https://images.unsplash.com/photo-1534430480872-3498386e7856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA5fDB8MXxjb2xsZWN0aW9ufDF8fDE2MjM4NjV8fHx8fDJ8fDE2MjM4NjU&ixlib=rb-1.2.1&q=80&w=400'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '별이 쏟아지는 은하수 카라반',
                description: '공기 좋은 청정 지역에서 밤하늘의 별을 감상하세요. 천체 망원경 구비.',
                capacity: 2,
                dailyRate: 200000,
                location: '전라북도 무주군',
                amenities: ['난방', '천체 망원경', '테라스'],
                photos: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA5fDB8MXxjb2xsZWN0aW9ufDF8fDE2MjM4NjV8fHx8fDJ8fDE2MjM4NjU&ixlib=rb-1.2.1&q=80&w=400'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '반려동물 동반 가능! 펫 프렌들리 카라반',
                description: '사랑하는 반려동물과 함께 떠나는 여행. 펫 전용 어메니티 완비.',
                capacity: 3,
                dailyRate: 170000,
                location: '경기도 양평군',
                amenities: ['샤워', '주방', '펫 전용 침대', '펫 드라이룸'],
                photos: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA5fDB8MXxjb2xsZWN0aW9ufDF8fDE2MjM4NjV8fHx8fDJ8fDE2MjM4NjU&ixlib=rb-1.2.1&q=80&w=400'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '익스트림 스포츠 매니아를 위한 카라반',
                description: '서핑, 패러글라이딩 명소와 가까운 베이스캠프. 장비 보관 공간 충분.',
                capacity: 4,
                dailyRate: 160000,
                location: '강원도 양양군',
                amenities: ['샤워', '장비 보관소', '외부 샤워 시설'],
photos: ['https://placehold.co/400x300/4682B4/FFFFFF?text=Extreme+Sports'],
                status: 'available',
            },
            {
                host: hostUser._id,
                name: '조용한 호숫가에서의 하룻밤',
                description: '잔잔한 호수를 바라보며 즐기는 완벽한 휴식. 낚시 가능.',
                capacity: 2,
                dailyRate: 185000,
                location: '충청북도 충주시',
                amenities: ['샤워', '주방', '낚시 도구 대여', '호수 뷰'],
                photos: ['https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA5fDB8MXxjb2xsZWN0aW9ufDF8fDE2MjM4NjV8fHx8fDJ8fDE2MjM4NjU&ixlib=rb-1.2.1&q=80&w=400'],
                status: 'available',
            },
        ];

        // 5. 샘플 데이터를 데이터베이스에 삽입
        await Caravan.insertMany(sampleCaravans);
        console.log('10 sample caravans have been inserted successfully!');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        // 6. 데이터베이스 연결 종료
        mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

// 스크립트 실행
seedCaravans();
