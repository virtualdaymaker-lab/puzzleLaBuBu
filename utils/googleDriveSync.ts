// Google Drive integration for saving game progress
export interface GameProgress {
  puzzleStates: Record<string, {
    completed: boolean;
    moves: number;
    timestamp: number;
  }>;
  lastPlayed: number;
  totalGamesCompleted: number;
}

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME = 'PuzLabu-GameData';

export const googleDriveSync = {
  async initGoogleDrive(accessToken: string) {
    // Initialize Google Drive API
    gapi.client.setApiKey(process.env.REACT_APP_GOOGLE_API_KEY || '');
    gapi.client.oauth2 = {
      access_token: accessToken,
    };
    return await gapi.client.load('drive', 'v3');
  },

  async getOrCreateFolder(accessToken: string): Promise<string> {
    const response = await gapi.client.drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      pageSize: 1,
      fields: 'files(id)',
    });

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    // Create folder if it doesn't exist
    const folderResponse = await gapi.client.drive.files.create({
      resource: {
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    return folderResponse.result.id;
  },

  async saveGameProgress(folderId: string, userId: string, progress: GameProgress) {
    const fileName = `puzlabu_progress_${userId}.json`;
    
    // Check if file already exists
    const listResponse = await gapi.client.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      pageSize: 1,
      fields: 'files(id)',
    });

    const fileContent = JSON.stringify(progress);
    const blob = new Blob([fileContent], { type: 'application/json' });

    if (listResponse.result.files && listResponse.result.files.length > 0) {
      // Update existing file
      const fileId = listResponse.result.files[0].id;
      return await gapi.client.drive.files.update({
        fileId: fileId,
        resource: {
          name: fileName,
        },
        media: {
          mimeType: 'application/json',
          body: blob,
        },
      });
    } else {
      // Create new file
      return await gapi.client.drive.files.create({
        resource: {
          name: fileName,
          parents: [folderId],
          mimeType: 'application/json',
        },
        media: {
          mimeType: 'application/json',
          body: blob,
        },
        fields: 'id',
      });
    }
  },

  async loadGameProgress(folderId: string, userId: string): Promise<GameProgress | null> {
    const fileName = `puzlabu_progress_${userId}.json`;
    
    try {
      const listResponse = await gapi.client.drive.files.list({
        q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        pageSize: 1,
        fields: 'files(id)',
      });

      if (!listResponse.result.files || listResponse.result.files.length === 0) {
        return null;
      }

      const fileId = listResponse.result.files[0].id;
      const fileResponse = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      return JSON.parse(fileResponse.result);
    } catch (error) {
      console.error('Error loading game progress:', error);
      return null;
    }
  },
};
