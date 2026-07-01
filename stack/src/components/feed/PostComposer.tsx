import { useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import {
  Code2,
  ImageIcon,
  Rocket,
  Sparkles,
  Trophy,
} from "lucide-react";

const POST_TYPES = [
  { value: "update", label: "Update", icon: Sparkles },
  { value: "code", label: "Code", icon: Code2 },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "project", label: "Project", icon: Rocket },
  { value: "achievement", label: "Achievement", icon: Trophy },
];

export default function PostComposer({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [type, setType] = useState("update");
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (!content.trim()) {
      toast.error("Write something to share");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/feed", {
        type,
        content: content.trim(),
        codeSnippet: type === "code" ? codeSnippet : undefined,
        codeLanguage: type === "code" ? codeLanguage : undefined,
        projectTitle: type === "project" ? projectTitle : undefined,
        projectUrl: type === "project" ? projectUrl : undefined,
        images: type === "image" && imageUrl ? [imageUrl] : [],
      });
      setContent("");
      setCodeSnippet("");
      setProjectTitle("");
      setProjectUrl("");
      setImageUrl("");
      toast.success("Post shared!");
      onCreated?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex flex-wrap gap-2 mb-3">
        {POST_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              type === value
                ? "bg-orange-100 border-orange-300 text-orange-800"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Share a technical update, tip, or achievement... Use #hashtags for discovery"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-none mb-3"
      />

      {type === "code" && (
        <div className="space-y-2 mb-3">
          <Input
            placeholder="Language (e.g. javascript, python)"
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
          />
          <Textarea
            placeholder="Paste your code snippet..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="font-mono text-sm min-h-[120px]"
          />
        </div>
      )}

      {type === "project" && (
        <div className="grid gap-2 mb-3 sm:grid-cols-2">
          <Input
            placeholder="Project title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
          <Input
            placeholder="Project URL"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
          />
        </div>
      )}

      {type === "image" && (
        <div className="mb-3">
          <Label className="text-xs text-gray-500 mb-1 block">Image URL</Label>
          <Input
            placeholder="https://example.com/image.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {submitting ? "Posting..." : "Share post"}
        </Button>
      </div>
    </div>
  );
}
