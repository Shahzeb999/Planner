'use server';

import fs from 'fs/promises';
import path from 'path';

export interface PlaybookFile {
  id: string;
  name: string;
  title: string;
  description: string;
  week?: number;
  category: string;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  technologies: string[];
  content: string;
}

// Parse metadata from markdown frontmatter or content
function parsePlaybookMetadata(content: string, filename: string): Partial<PlaybookFile> {
  const lines = content.split('\n');
  const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || 
                filename.replace(/^\d+_/, '').replace(/_/g, ' ').replace('.md', '');
  
  // Extract description from first paragraph after title
  const titleIndex = lines.findIndex(line => line.startsWith('# '));
  const description = lines
    .slice(titleIndex + 1)
    .find(line => line.trim() && !line.startsWith('#'))
    ?.trim() || 'No description available';

  // Extract estimated hours from content
  const hoursMatch = content.match(/(\d+)[\s-]*hours?/i);
  const estimatedHours = hoursMatch ? parseInt(hoursMatch[1]) : 6;

  // Extract difficulty
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
  if (content.toLowerCase().includes('beginner') || content.toLowerCase().includes('basic')) {
    difficulty = 'Beginner';
  } else if (content.toLowerCase().includes('advanced') || content.toLowerCase().includes('expert')) {
    difficulty = 'Advanced';
  }

  // Extract category from filename or content
  let category = 'General';
  if (filename.includes('transformer') || content.toLowerCase().includes('transformer')) {
    category = 'Deep Learning';
  } else if (filename.includes('rag') || filename.includes('chatbot')) {
    category = 'LLM Applications';
  } else if (filename.includes('lora') || filename.includes('finetuning')) {
    category = 'Model Training';
  } else if (filename.includes('evaluation')) {
    category = 'Evaluation';
  } else if (filename.includes('prompt')) {
    category = 'Prompt Engineering';
  } else if (filename.includes('cloud') || filename.includes('iam')) {
    category = 'Cloud & Infrastructure';
  } else if (filename.includes('docker') || filename.includes('k8s')) {
    category = 'DevOps';
  } else if (filename.includes('quantization') || filename.includes('pruning')) {
    category = 'Model Optimization';
  } else if (filename.includes('monitoring') || filename.includes('mlflow')) {
    category = 'MLOps';
  } else if (filename.includes('system_design')) {
    category = 'System Design';
  } else if (filename.includes('portfolio')) {
    category = 'Career';
  }

  // Extract prerequisites and technologies from content
  const prerequisites: string[] = [];
  const technologies: string[] = [];
  
  // Look for common technology mentions
  const techPatterns = [
    'pytorch', 'tensorflow', 'numpy', 'pandas', 'matplotlib', 'scikit-learn',
    'langchain', 'openai', 'pinecone', 'docker', 'kubernetes', 'aws', 'gcp',
    'mlflow', 'wandb', 'transformers', 'huggingface', 'python', 'javascript',
    'react', 'node.js', 'fastapi', 'flask', 'redis', 'postgresql'
  ];
  
  techPatterns.forEach(tech => {
    if (content.toLowerCase().includes(tech)) {
      technologies.push(tech.charAt(0).toUpperCase() + tech.slice(1));
    }
  });

  // Extract week number from filename
  const weekMatch = filename.match(/^(\d+)_/);
  const week = weekMatch ? parseInt(weekMatch[1]) : undefined;

  return {
    title,
    description,
    week,
    category,
    estimatedHours,
    difficulty,
    prerequisites,
    technologies,
  };
}

export async function loadPlaybook(playbookId: string): Promise<PlaybookFile | null> {
  try {
    const playbooksDir = path.join(process.cwd(), 'public', 'playbooks');
    
    // Try exact filename first
    let filename = `${playbookId}.md`;
    if (!playbookId.endsWith('.md')) {
      filename = `${playbookId}.md`;
    }

    const filePath = path.join(playbooksDir, filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const metadata = parsePlaybookMetadata(content, filename);
      
      return {
        id: playbookId,
        name: filename,
        content,
        ...metadata,
        title: metadata.title!,
        description: metadata.description!,
        category: metadata.category!,
        estimatedHours: metadata.estimatedHours!,
        difficulty: metadata.difficulty!,
        prerequisites: metadata.prerequisites!,
        technologies: metadata.technologies!,
      };
    } catch (error) {
      console.error(`Playbook not found: ${filename}`, error);
      return null;
    }
  } catch (error) {
    console.error('Error loading playbook:', error);
    return null;
  }
}

export async function loadAllPlaybooks(): Promise<PlaybookFile[]> {
  try {
    const playbooksDir = path.join(process.cwd(), 'public', 'playbooks');
    const files = await fs.readdir(playbooksDir);
    
    const playbooks: PlaybookFile[] = [];
    
    for (const file of files) {
      if (file.endsWith('.md') && !file.startsWith('.')) {
        const playbookId = file.replace('.md', '');
        const playbook = await loadPlaybook(playbookId);
        if (playbook) {
          playbooks.push(playbook);
        }
      }
    }
    
    // Sort by week number, then alphabetically
    return playbooks.sort((a, b) => {
      if (a.week && b.week) return a.week - b.week;
      if (a.week) return -1;
      if (b.week) return 1;
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error('Error loading playbooks:', error);
    return [];
  }
}

// Get playbook completion status from database
export async function getPlaybookProgress(playbookId: string): Promise<{
  totalItems: number;
  completedItems: number;
  completed: boolean;
}> {
  try {
    // This would query the playbookChecklists table
    // For now, return default values
    return {
      totalItems: 0,
      completedItems: 0,
      completed: false,
    };
  } catch (error) {
    console.error('Error getting playbook progress:', error);
    return {
      totalItems: 0,
      completedItems: 0,
      completed: false,
    };
  }
}
