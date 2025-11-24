import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'articles', filename);
    
    // Check if file exists before trying to delete
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return NextResponse.json({ message: 'File cleaned up successfully' });
    } catch (error) {
        // If file doesn't exist, it might have been cleaned up already. This is not a server error.
        return NextResponse.json({ message: 'File not found, may have been cleaned up already.' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error cleaning up file:', error);
    return NextResponse.json({ message: 'Error cleaning up file' }, { status: 500 });
  }
}
