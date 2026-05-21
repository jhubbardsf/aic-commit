import { spawn } from 'child_process';

export interface GHPRCreateOptions {
  base: string;
  title: string;
  body: string;
  open?: boolean;
}

export interface GHPRResult {
  url: string;
  number: number;
}

/**
 * Check if gh CLI is installed and authenticated
 */
export async function validateGHCLI(): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Check if gh is installed
  try {
    await execGH(['--version']);
  } catch {
    return {
      valid: false,
      error:
        'GitHub CLI (gh) is not installed. Install it from https://cli.github.com/',
    };
  }

  // Check if authenticated
  try {
    await execGH(['auth', 'status']);
  } catch {
    return {
      valid: false,
      error: 'GitHub CLI is not authenticated. Run "gh auth login" first.',
    };
  }

  return { valid: true };
}

/**
 * Check if a PR already exists for the current branch
 */
export async function checkExistingPR(): Promise<string | null> {
  try {
    const result = await execGH(['pr', 'view', '--json', 'url', '-q', '.url']);
    return result.trim() || null;
  } catch {
    // No PR exists (gh returns error when no PR found)
    return null;
  }
}

/**
 * Check if the current branch needs to be pushed to remote
 */
export async function needsPush(): Promise<boolean> {
  try {
    // Check if branch has an upstream set
    await execCommand('git', ['rev-parse', '--abbrev-ref', '@{u}']);
    // Has upstream, check if we're ahead
    const result = await execCommand('git', ['status', '--porcelain', '-b']);
    return result.includes('[ahead');
  } catch {
    // No upstream set - needs push
    return true;
  }
}

/**
 * Push the current branch to origin with upstream tracking
 */
export async function pushBranch(branchName: string): Promise<void> {
  try {
    await execCommand('git', ['push', '-u', 'origin', branchName]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to push branch: ${error.message}`);
    }
    throw new Error('Failed to push branch');
  }
}

/**
 * Create a PR using gh CLI
 */
export async function createPR(
  options: GHPRCreateOptions
): Promise<GHPRResult> {
  const { base, title, body, open = true } = options;

  const args = [
    'pr',
    'create',
    '--base',
    base,
    '--title',
    title,
    '--body',
    body,
  ];

  // gh pr create doesn't open browser by default, --web opens it
  if (open) {
    args.push('--web');
  }

  try {
    const stdout = await execGH(args);

    // Parse the PR URL from stdout
    const url = stdout.trim();
    const prNumberMatch = url.match(/\/pull\/(\d+)/);
    const number =
      prNumberMatch && prNumberMatch[1] ? parseInt(prNumberMatch[1], 10) : 0;

    return { url, number };
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('already exists')) {
        throw new Error('A pull request already exists for this branch.');
      }
      if (message.includes('no commits')) {
        throw new Error('No commits between base branch and current branch.');
      }
      if (message.includes('not a git repository')) {
        throw new Error('Not in a git repository.');
      }
      if (message.includes('no upstream')) {
        throw new Error(
          'Current branch has no remote tracking. Push your branch first with "git push -u origin <branch>".'
        );
      }

      throw new Error(`Failed to create PR: ${error.message}`);
    }
    throw new Error('Unknown error creating PR');
  }
}

/**
 * Execute a gh command and return stdout
 */
function execGH(args: string[]): Promise<string> {
  return execCommand('gh', args);
}

/**
 * Execute a command and return stdout
 */
function execCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `${command} exited with code ${code}`));
        return;
      }
      resolve(stdout);
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
