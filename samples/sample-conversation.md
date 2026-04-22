# Title: 샘플 대화 — React 훅 사용법

H: useState랑 useEffect 차이가 뭐야?

A: 간단히 정리해줄게.

- **useState**: 컴포넌트의 상태를 관리하는 훅. 값이 바뀌면 리렌더링.
- **useEffect**: 렌더링 후에 실행되는 사이드 이펙트(데이터 페칭, 구독 등)를 관리하는 훅.

H: 예시 코드 보여줄 수 있어?

A: 물론이지.

```js
const [count, setCount] = useState(0)

useEffect(() => {
  console.log('count changed:', count)
}, [count])
```

이런 식으로 써.

Title: 두 번째 샘플 — 커피 vs 콜라

H: 개발자는 커피를 많이 마신다던데 맞아?

A: 사람마다 다르지만, 콜라 파도 많아! 카페인 공급원은 취향이니까.
