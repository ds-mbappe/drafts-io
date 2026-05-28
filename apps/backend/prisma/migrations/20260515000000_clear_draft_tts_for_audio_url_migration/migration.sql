-- This migration clears cached TTS data to force regeneration with the new audio URL format.
DELETE FROM "DraftTts";
