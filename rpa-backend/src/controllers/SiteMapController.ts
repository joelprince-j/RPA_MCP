import { Request, Response } from 'express';
import { SiteMapperService } from '../services/SiteMapperService';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitemapsDir = path.join(__dirname, '../../data/sitemaps');

// Ensure directory exists
if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

export class SiteMapController {
  static async createSiteMap(req: Request, res: Response) {
    try {
      const { url, depth = 2, maxPages = 10 } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      console.log(`Creating site map for: ${url}`);

      const mapper = new SiteMapperService();
      const siteMap = await mapper.mapSite(url, { depth, maxPages });

      // Save to file
      const filename = `${siteMap.siteMapId}.json`;
      const filepath = path.join(sitemapsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(siteMap, null, 2));

      res.json({
        success: true,
        siteMapId: siteMap.siteMapId,
        siteMap,
      });
    } catch (error: any) {
      console.error('Error creating site map:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getSiteMap(req: Request, res: Response) {
    try {
      const { siteMapId } = req.params;

      const filepath = path.join(sitemapsDir, `${siteMapId}.json`);

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Site map not found' });
      }

      const siteMap = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      res.json(siteMap);
    } catch (error: any) {
      console.error('Error getting site map:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async listSiteMaps(req: Request, res: Response) {
    try {
      const files = fs.readdirSync(sitemapsDir);
      
      const sitemaps = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const content = JSON.parse(fs.readFileSync(path.join(sitemapsDir, file), 'utf-8'));
          return {
            siteMapId: content.siteMapId,
            baseUrl: content.baseUrl,
            timestamp: content.timestamp,
            totalPages: content.metadata.totalPages,
            totalElements: content.metadata.totalElements,
          };
        });

      res.json(sitemaps);
    } catch (error: any) {
      console.error('Error listing site maps:', error);
      res.status(500).json({ error: error.message });
    }
  }
}