// 生成随机不重复 id
export default function createRandomID(randomLength) {
    randomLength = randomLength || 8;
    return Number(Math.random().toString().substring(3, randomLength) + Date.now()).toString(36)
}