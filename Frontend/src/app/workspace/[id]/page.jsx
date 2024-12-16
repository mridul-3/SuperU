"use client";

import Sidebar from "@/components/sidebar";
import Tiptap from "@/components/Tiptap";
import { Card, Typography } from "@material-tailwind/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export default function Workspace() {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const fetchWorkspace = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-file/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('token'),
        },
        withCredentials: true,
      });
      const data = await response.json();
      setContent(data.content || '');
      setEditedContent(data.content || ''); // Sync initial content for editing
    } catch (error) {
      console.error('Error fetching workspace content:', error);
    }
  };

  const saveContent = useCallback(
    async (updatedContent) => {
        console.log('Auto-saving content:', updatedContent);
      try {
        console.log('Auto-saving content:', updatedContent);
        await fetch(`http://127.0.0.1:5000/update-file/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
          },
          body: JSON.stringify({
            "content": {"text": updatedContent},
          }),
        });
      } catch (error) {
        console.error('Error saving workspace content:', error);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="grow w-full overflow-x-hidden transition-all duration-300 flex flex-col ml-14 mt-10">
        <div className="my-3">
          <Typography variant="h2" color="indigo">Workspace Editor</Typography>
        </div>
        <div className="flex w-11/12">
          {/* Non-editable left Tiptap */}
          <Card color="white" shadow={false} className="p-10 flex justify-center item-center w-1/2 mx-4">
            <Tiptap content={content} editable={false} />
          </Card>
          {/* Editable right Tiptap */}
          <Card color="white" shadow={false} className="p-10 flex justify-center item-center w-1/2 mx-4">
            <Tiptap
              content={editedContent}
              editable={true}
              onContentChange={(updatedContent) => {
                saveContent(updatedContent);
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
