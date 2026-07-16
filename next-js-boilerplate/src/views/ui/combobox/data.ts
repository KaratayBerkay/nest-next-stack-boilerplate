export const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

export const languages = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "py", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rs", label: "Rust" },
];

export interface GroupedOption {
  group: string;
  items: { value: string; label: string }[];
}

export const groupedData: GroupedOption[] = [
  {
    group: "Fruits",
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "orange", label: "Orange" },
      { value: "grape", label: "Grape" },
      { value: "strawberry", label: "Strawberry" },
      { value: "mango", label: "Mango" },
      { value: "kiwi", label: "Kiwi" },
    ],
  },
  {
    group: "Vegetables",
    items: [
      { value: "carrot", label: "Carrot" },
      { value: "broccoli", label: "Broccoli" },
      { value: "spinach", label: "Spinach" },
      { value: "tomato", label: "Tomato" },
      { value: "potato", label: "Potato" },
      { value: "cucumber", label: "Cucumber" },
    ],
  },
  {
    group: "Grains",
    items: [
      { value: "rice", label: "Rice" },
      { value: "wheat", label: "Wheat" },
      { value: "oats", label: "Oats" },
      { value: "barley", label: "Barley" },
      { value: "quinoa", label: "Quinoa" },
    ],
  },
];

export const asyncData = [
  { value: "alice", label: "Alice Johnson" },
  { value: "bob", label: "Bob Smith" },
  { value: "charlie", label: "Charlie Brown" },
  { value: "diana", label: "Diana Prince" },
  { value: "edward", label: "Edward Norton" },
  { value: "fiona", label: "Fiona Apple" },
  { value: "george", label: "George Lucas" },
  { value: "helen", label: "Helen Mirren" },
  { value: "ivan", label: "Ivan Petrov" },
  { value: "julia", label: "Julia Roberts" },
];

export const multiData = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik" },
  { value: "angular", label: "Angular" },
  { value: "ember", label: "Ember" },
];

export const creatableInitial = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
];

export const cities = [
  { value: "istanbul", label: "İstanbul" },
  { value: "ankara", label: "Ankara" },
  { value: "izmir", label: "İzmir" },
  { value: "bursa", label: "Bursa" },
  { value: "antalya", label: "Antalya" },
];
