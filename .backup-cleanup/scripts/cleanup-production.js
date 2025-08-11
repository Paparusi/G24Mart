#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Configuration
const PROJECT_ROOT = process.cwd()
const BACKUP_DIR = path.join(PROJECT_ROOT, '.backup-cleanup')

// File extensions to process
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'backup', '.backup-cleanup']

// Patterns to remove or fix
const CLEANUP_PATTERNS = [
  // Console statements
  {
    name: 'Console.log statements',
    pattern: /console\.(log|info|debug|warn|error)\([^)]*\);?\s*$/gm,
    replacement: '',
    description: 'Remove console.log statements'
  },
  
  // TODO and FIXME comments
  {
    name: 'TODO/FIXME comments',
    pattern: /\/\/\s*(TODO|FIXME|XXX|HACK).*$/gm,
    replacement: '',
    description: 'Remove TODO/FIXME comments'
  },
  
  // Empty lines (multiple consecutive)
  {
    name: 'Multiple empty lines',
    pattern: /\n\s*\n\s*\n/g,
    replacement: '\n\n',
    description: 'Reduce multiple empty lines'
  },
  
  // Mock data comments
  {
    name: 'Mock data comments',
    pattern: /\/\/\s*(Mock|mock|MOCK).*$/gm,
    replacement: '',
    description: 'Remove mock data comments'
  },
  
  // Debug comments
  {
    name: 'Debug comments',
    pattern: /\/\/\s*(Debug|DEBUG|debug).*$/gm,
    replacement: '',
    description: 'Remove debug comments'
  },
  
  // Unused imports (basic detection)
  {
    name: 'Unused React imports',
    pattern: /import\s+React\s*,?\s*{\s*}\s+from\s+['"]react['"];?\s*\n/g,
    replacement: "import React from 'react'\n",
    description: 'Fix empty React imports'
  },
  
  // Placeholder text improvements
  {
    name: 'Generic placeholders',
    pattern: /placeholder=["']VD:.*?["']/g,
    replacement: '',
    description: 'Remove example placeholders',
    manual: true // Requires manual review
  }
]

// Statistics
let stats = {
  filesProcessed: 0,
  changesApplied: 0,
  backupsCreated: 0,
  patterns: {}
}

function createBackup(filePath, content) {
  const relativePath = path.relative(PROJECT_ROOT, filePath)
  const backupPath = path.join(BACKUP_DIR, relativePath)
  
  // Ensure backup directory exists
  const backupDir = path.dirname(backupPath)
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  fs.writeFileSync(backupPath, content, 'utf8')
  stats.backupsCreated++
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const originalContent = content
    let modifiedContent = content
    let fileChanged = false
    
    // Apply each cleanup pattern
    CLEANUP_PATTERNS.forEach(cleanupPattern => {
      if (cleanupPattern.manual) return // Skip manual patterns for now
      
      const matches = modifiedContent.match(cleanupPattern.pattern)
      if (matches) {
        modifiedContent = modifiedContent.replace(cleanupPattern.pattern, cleanupPattern.replacement)
        const changeCount = matches.length
        
        if (!stats.patterns[cleanupPattern.name]) {
          stats.patterns[cleanupPattern.name] = 0
        }
        stats.patterns[cleanupPattern.name] += changeCount
        stats.changesApplied += changeCount
        fileChanged = true
        
        console.log(`  ✓ ${cleanupPattern.name}: ${changeCount} changes`)
      }
    })
    
    // Custom cleanups specific to this project
    const customCleanups = [
      // Remove mock data arrays (more sophisticated)
      {
        pattern: /const mock[A-Z]\w*:\s*\w+\[\]\s*=\s*\[[^\]]*\]/g,
        name: 'Mock data arrays',
        manual: true
      },
      
      // Remove development console logs in specific patterns
      {
        pattern: /console\.log\(['"`].*?scan.*?['"`].*?\);?\s*$/gm,
        name: 'Scan-related console logs'
      },
      
      // Remove debug render logs
      {
        pattern: /console\.log\(['"`].*?(render|Render).*?['"`].*?\);?\s*$/gm,
        name: 'Render debug logs'
      }
    ]
    
    customCleanups.forEach(cleanup => {
      if (cleanup.manual) return
      
      const matches = modifiedContent.match(cleanup.pattern)
      if (matches) {
        modifiedContent = modifiedContent.replace(cleanup.pattern, '')
        const changeCount = matches.length
        
        if (!stats.patterns[cleanup.name]) {
          stats.patterns[cleanup.name] = 0
        }
        stats.patterns[cleanup.name] += changeCount
        stats.changesApplied += changeCount
        fileChanged = true
        
        console.log(`  ✓ ${cleanup.name}: ${changeCount} changes`)
      }
    })
    
    if (fileChanged) {
      // Create backup before modifying
      createBackup(filePath, originalContent)
      
      // Write cleaned content
      fs.writeFileSync(filePath, modifiedContent, 'utf8')
      console.log(`✅ Cleaned: ${path.relative(PROJECT_ROOT, filePath)}`)
    }
    
    stats.filesProcessed++
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`)
  }
}

function shouldSkipDirectory(dirPath) {
  const dirName = path.basename(dirPath)
  return EXCLUDE_DIRS.includes(dirName) || dirName.startsWith('.')
}

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath)
  return CODE_EXTENSIONS.includes(ext)
}

function walkDirectory(dirPath) {
  const items = fs.readdirSync(dirPath)
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item)
    const stat = fs.statSync(itemPath)
    
    if (stat.isDirectory()) {
      if (!shouldSkipDirectory(itemPath)) {
        walkDirectory(itemPath)
      }
    } else if (stat.isFile() && shouldProcessFile(itemPath)) {
      console.log(`\n📁 Processing: ${path.relative(PROJECT_ROOT, itemPath)}`)
      processFile(itemPath)
    }
  })
}

function generateReport() {
  console.log('\n' + '='.repeat(60))
  console.log('🧹 CLEANUP REPORT')
  console.log('='.repeat(60))
  console.log(`Files processed: ${stats.filesProcessed}`)
  console.log(`Total changes applied: ${stats.changesApplied}`)
  console.log(`Backups created: ${stats.backupsCreated}`)
  
  if (stats.backupsCreated > 0) {
    console.log(`Backup location: ${path.relative(PROJECT_ROOT, BACKUP_DIR)}`)
  }
  
  console.log('\n📊 Changes by type:')
  Object.entries(stats.patterns).forEach(([pattern, count]) => {
    console.log(`  • ${pattern}: ${count}`)
  })
  
  console.log('\n💡 Manual Review Needed:')
  console.log('  • Mock data arrays - Review and replace with real data flows')
  console.log('  • API endpoints - Ensure all are production-ready')
  console.log('  • Error handling - Verify all edge cases are handled')
  console.log('  • Type safety - Check for any remaining `any` types')
  
  console.log('\n✨ Next Steps:')
  console.log('  1. Review changes using git diff')
  console.log('  2. Test all functionality thoroughly')
  console.log('  3. Run build to check for any issues')
  console.log('  4. Update documentation')
}

function main() {
  console.log('🚀 Starting G24Mart Production Cleanup...')
  console.log(`Working directory: ${PROJECT_ROOT}`)
  
  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
  
  // Start processing
  const startTime = Date.now()
  walkDirectory(PROJECT_ROOT)
  const endTime = Date.now()
  
  // Generate report
  generateReport()
  
  console.log(`\n⏱️  Completed in ${endTime - startTime}ms`)
  console.log('🎉 Cleanup finished! Review changes before committing.')
  
  // Return stats for potential CI integration
  return stats
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main, stats }
