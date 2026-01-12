import { Request, Response } from 'express';
import { FlowExecutionService } from '../services/FlowExecutionService';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flowsDir = path.join(__dirname, '../../data/flows');
const executionsDir = path.join(__dirname, '../../data/executions');

// Ensure directories exist
[flowsDir, executionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export class FlowController {
  static async saveFlow(req: Request, res: Response) {
    try {
      const flow = req.body;

      if (!flow.flowId) {
        return res.status(400).json({ error: 'Flow ID is required' });
      }

      const filename = `${flow.flowId}.json`;
      const filepath = path.join(flowsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(flow, null, 2));

      res.json({ success: true, flowId: flow.flowId });
    } catch (error: any) {
      console.error('Error saving flow:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getFlow(req: Request, res: Response) {
    try {
      const { flowId } = req.params;

      const filepath = path.join(flowsDir, `${flowId}.json`);

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Flow not found' });
      }

      const flow = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      res.json(flow);
    } catch (error: any) {
      console.error('Error getting flow:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async listFlows(req: Request, res: Response) {
    try {
      const files = fs.readdirSync(flowsDir);
      
      const flows = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const content = JSON.parse(fs.readFileSync(path.join(flowsDir, file), 'utf-8'));
          return {
            flowId: content.flowId,
            name: content.name,
            description: content.description,
            totalSteps: content.steps.length,
          };
        });

      res.json(flows);
    } catch (error: any) {
      console.error('Error listing flows:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async executeFlow(req: Request, res: Response) {
    try {
      const { flowId, variables } = req.body;

      // Load flow
      const filepath = path.join(flowsDir, `${flowId}.json`);

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Flow not found' });
      }

      const flow = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      // Replace variables if provided
      if (variables) {
        flow.variables = { ...flow.variables, ...variables };
      }

      // Execute flow
      const executor = new FlowExecutionService();
      const report = await executor.executeFlow(flow);

      // Save execution report
      const reportFilename = `${report.executionId}.json`;
      const reportFilepath = path.join(executionsDir, reportFilename);
      fs.writeFileSync(reportFilepath, JSON.stringify(report, null, 2));

      res.json(report);
    } catch (error: any) {
      console.error('Error executing flow:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getExecutionReport(req: Request, res: Response) {
    try {
      const { executionId } = req.params;

      const filepath = path.join(executionsDir, `${executionId}.json`);

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Execution report not found' });
      }

      const report = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      res.json(report);
    } catch (error: any) {
      console.error('Error getting execution report:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Execute flow partially and extract current page elements
   * This is used when user wants to continue building flow after a redirect
   */
  static async executeFlowPartial(req: Request, res: Response) {
    try {
      const { flowId, upToStepId } = req.body;

      // Load flow
      const filepath = path.join(flowsDir, `${flowId}.json`);

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Flow not found' });
      }

      const flow = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      // Execute flow partially
      const executor = new FlowExecutionService();
      const result = await executor.executeFlowPartial(flow, upToStepId);

      res.json(result);
    } catch (error: any) {
      console.error('Error executing flow partially:', error);
      res.status(500).json({ error: error.message });
    }
  }
}