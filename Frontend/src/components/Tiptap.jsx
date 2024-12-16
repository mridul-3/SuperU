'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useCallback } from 'react';

// Debounce function to delay execution
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const Tiptap = ({ content = 'Start writing...', editable = true, onContentChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editable: editable,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content.text);
    }
  }, [editor, content]);

  // Handle content change with debounce
  const handleContentChange = useCallback(
    debounce((updatedContent) => {
      if (onContentChange) {
        onContentChange(updatedContent); // Call parent handler
      }
    }, 1000), // Save after 1-second delay
    [onContentChange]
  );

  // Listen to editor updates
  useEffect(() => {
    if (editor && editable) {
      editor.on('update', () => {
        const updatedContent = editor.getHTML();
        console.log('Content updated:', updatedContent);
        handleContentChange(updatedContent);
      });
    }
    return () => {
      if (editor) {
        editor.off('update');
      }
    };
  }, [editor, editable, handleContentChange]);

  return editor ? <EditorContent editor={editor} /> : <div>Loading editor...</div>;
};

export default Tiptap;
