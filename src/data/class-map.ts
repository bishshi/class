import { people } from "./people";

export interface ClassMapEntry {
  personSlug: string;
  city: string;
  province: string;
  /** 城市中心点经度，仅用于城市级地图投影。 */
  longitude: number;
  /** 城市中心点纬度，仅用于城市级地图投影。 */
  latitude: number;
}

/**
 * 只有明确同意在班级地图公开的同学，才应出现在这个列表中。
 * 地图仅展示城市中心点，不采集或保存个人精确位置。
 */
export const classMapEntries: ClassMapEntry[] = [
  { personSlug: "student-a", city: "北京", province: "北京市", longitude: 116.4074, latitude: 39.9042 },
  { personSlug: "biss", city: "高平", province: "山西省", longitude: 112.9239, latitude: 35.798 }
];

const peopleBySlug = new Map(people.map((person) => [person.slug, person]));

const toMapPerson = (person: (typeof people)[number]) => ({
  slug: person.slug,
  initial: person.initial,
  name: person.name,
  photo: person.photo,
  direction: person.direction
});

export const mapCities = Array.from(
  classMapEntries.reduce((cities, entry) => {
    const person = peopleBySlug.get(entry.personSlug);
    if (!person) return cities;

    const key = `${entry.province}-${entry.city}`;
    const existing = cities.get(key);

    if (existing) {
      existing.people.push(toMapPerson(person));
    } else {
      cities.set(key, {
        key,
        city: entry.city,
        province: entry.province,
        longitude: entry.longitude,
        latitude: entry.latitude,
        people: [toMapPerson(person)]
      });
    }

    return cities;
  }, new Map<string, {
    key: string;
    city: string;
    province: string;
    longitude: number;
    latitude: number;
    people: ReturnType<typeof toMapPerson>[];
  }>()).values()
).sort((a, b) => b.people.length - a.people.length || a.city.localeCompare(b.city, "zh-CN"));

export const mapStats = {
  cityCount: mapCities.length,
  publicPeopleCount: mapCities.reduce((total, city) => total + city.people.length, 0),
  provinceCount: new Set(mapCities.map((city) => city.province)).size
};
