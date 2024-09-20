import { NextResponse } from "next/server";
import { firestore } from "../../../lib/firebaseAdmin";

// Firestore schema interface
interface FirestoreSchema {
  name: string;
  fields: string[];
}

// Query parameter interface for Firestore query
interface QueryParam {
  field: string;
  operator: FirebaseFirestore.WhereFilterOp;
  value: any;
}

// Request body interface for POST method
interface RequestBody {
  collectionName: string;
  queryParams?: QueryParam[];
  limit?: number;
  startAfterId?: string;
  startAfterValue?: any;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

// Firestore document interface
interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

// Handle GET requests for Firestore schema
export async function GET() {
  try {
    const collections = await firestore.listCollections();
    const schema: FirestoreSchema[] = await Promise.all(
      collections.map(async (collection) => {
        const snapshot = await collection.limit(1).get(); // Limit 1 to sample the collection
        const fields = snapshot.docs[0]?.data();
        return {
          name: collection.id,
          fields: fields ? Object.keys(fields) : [],
        };
      })
    );

    return NextResponse.json({ schema }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Firestore schema:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handle POST requests to query a collection with pagination
export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const {
      collectionName,
      queryParams,
      limit,
      startAfterId,
      startAfterValue,
      orderBy,
      orderDirection,
    } = body;

    // Validate the collectionName field
    if (!collectionName) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      firestore.collection(collectionName);

    // Apply optional query parameters (e.g., where clauses)
    if (queryParams && Array.isArray(queryParams)) {
      queryParams.forEach(({ field, operator, value }) => {
        if (typeof field === "string" && operator && value !== undefined) {
          query = query.where(field, operator, value);
        }
      });
    }

    // Apply orderBy if specified, otherwise order by '__name__' (document ID)
    if (orderBy) {
      query = query.orderBy(orderBy, orderDirection || "asc");
    } else {
      query = query.orderBy("__name__");
    }

    // Apply startAfter if specified
    if (startAfterId) {
      // Get the document snapshot using the ID
      const lastDocSnapshot = await firestore
        .collection(collectionName)
        .doc(startAfterId)
        .get();
      if (lastDocSnapshot.exists) {
        query = query.startAfter(lastDocSnapshot);
      } else {
        return NextResponse.json(
          { error: "Invalid startAfterId" },
          { status: 400 }
        );
      }
    } else if (startAfterValue !== undefined) {
      query = query.startAfter(startAfterValue);
    }

    // Apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const documents: FirestoreDocument[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Prepare nextPageToken
    let nextPageTokenId: string | null = null;
    let nextPageTokenValue: any = null;

    if (documents.length > 0 && limit && documents.length === limit) {
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      nextPageTokenId = lastDoc.id;
      if (orderBy && orderBy !== "__name__") {
        nextPageTokenValue = lastDoc.get(orderBy);
      }
    }

    return NextResponse.json(
      { documents, nextPageTokenId, nextPageTokenValue },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error querying Firestore collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
