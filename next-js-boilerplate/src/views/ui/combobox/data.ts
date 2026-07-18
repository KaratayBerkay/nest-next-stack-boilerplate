export const assignees = [
  { value: "alex-chen", label: "Alex Chen" },
  { value: "sarah-kim", label: "Sarah Kim" },
  { value: "marcus-johnson", label: "Marcus Johnson" },
  { value: "priya-patel", label: "Priya Patel" },
  { value: "diego-ramirez", label: "Diego Ramirez" },
  { value: "emma-wilson", label: "Emma Wilson" },
];

export const countries = [
  { value: "afghanistan", label: "Afghanistan" },
  { value: "albania", label: "Albania" },
  { value: "algeria", label: "Algeria" },
  { value: "andorra", label: "Andorra" },
  { value: "angola", label: "Angola" },
  { value: "argentina", label: "Argentina" },
  { value: "australia", label: "Australia" },
  { value: "austria", label: "Austria" },
  { value: "belgium", label: "Belgium" },
  { value: "brazil", label: "Brazil" },
  { value: "canada", label: "Canada" },
  { value: "chile", label: "Chile" },
  { value: "china", label: "China" },
  { value: "colombia", label: "Colombia" },
  { value: "denmark", label: "Denmark" },
  { value: "egypt", label: "Egypt" },
  { value: "finland", label: "Finland" },
  { value: "france", label: "France" },
  { value: "germany", label: "Germany" },
  { value: "greece", label: "Greece" },
  { value: "india", label: "India" },
  { value: "indonesia", label: "Indonesia" },
  { value: "italy", label: "Italy" },
  { value: "japan", label: "Japan" },
  { value: "mexico", label: "Mexico" },
  { value: "netherlands", label: "Netherlands" },
  { value: "new-zealand", label: "New Zealand" },
  { value: "norway", label: "Norway" },
  { value: "poland", label: "Poland" },
  { value: "portugal", label: "Portugal" },
  { value: "south-korea", label: "South Korea" },
  { value: "spain", label: "Spain" },
  { value: "sweden", label: "Sweden" },
  { value: "switzerland", label: "Switzerland" },
  { value: "turkey", label: "Turkey" },
  { value: "united-kingdom", label: "United Kingdom" },
  { value: "united-states", label: "United States" },
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
