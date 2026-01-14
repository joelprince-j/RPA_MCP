import { Request, Response } from 'express';
import { FlowRecorderService } from '../services/FlowRecorderService';

const recorderService = new FlowRecorderService();

export class RecorderController {
  /**
   * Start a new recording session
   */
  static async startRecording(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      console.log(`Starting recording session for: ${url}`);
      const sessionId = await recorderService.startRecording(url);

      res.json({
        success: true,
        sessionId,
        message: 'Recording started. Browser window opened.',
      });
    } catch (error: any) {
      console.error('Error starting recording:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get recording status
   */
  static async getRecordingStatus(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      const status = recorderService.getRecordingStatus(sessionId);

      if (!status) {
        return res.status(404).json({ error: 'Recording session not found' });
      }

      res.json(status);
    } catch (error: any) {
      console.error('Error getting recording status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Stop recording and get Flow JSON
   */
  static async stopRecording(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      console.log(`Stopping recording session: ${sessionId}`);
      const flow = await recorderService.stopRecording(sessionId);

      res.json({
        success: true,
        flow,
        message: 'Recording stopped and flow generated',
      });
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cancel/abort recording
   */
  static async cancelRecording(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      await recorderService.cancelRecording(sessionId);

      res.json({
        success: true,
        message: 'Recording cancelled',
      });
    } catch (error: any) {
      console.error('Error cancelling recording:', error);
      res.status(500).json({ error: error.message });
    }
  }
}




