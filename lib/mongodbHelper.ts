import clientPromise from "./mongodb";

export async function getCollection(name: string) {
  const client = await clientPromise;
  const db = client.db("mydb");
  return db.collection(name);
}
