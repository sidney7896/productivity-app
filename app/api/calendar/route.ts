import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

// GET: fetch events
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get("timeMin") || new Date().toISOString();
  const timeMax = searchParams.get("timeMax");
  const maxResults = parseInt(searchParams.get("maxResults") || "50");

  try {
    const calendar = getCalendarClient((session as any).accessToken);
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax: timeMax || undefined,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json({ events: res.data.items || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST: create event
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const calendar = getCalendarClient((session as any).accessToken);
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: body.summary,
        description: body.description,
        start: {
          dateTime: body.startDateTime,
          timeZone: body.timeZone || "Europe/Amsterdam",
        },
        end: {
          dateTime: body.endDateTime,
          timeZone: body.timeZone || "Europe/Amsterdam",
        },
      },
    });

    return NextResponse.json({ event: res.data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT: update event
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const calendar = getCalendarClient((session as any).accessToken);
    const res = await calendar.events.update({
      calendarId: "primary",
      eventId: body.eventId,
      requestBody: {
        summary: body.summary,
        description: body.description,
        start: {
          dateTime: body.startDateTime,
          timeZone: body.timeZone || "Europe/Amsterdam",
        },
        end: {
          dateTime: body.endDateTime,
          timeZone: body.timeZone || "Europe/Amsterdam",
        },
      },
    });

    return NextResponse.json({ event: res.data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE: delete event
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    const calendar = getCalendarClient((session as any).accessToken);
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
