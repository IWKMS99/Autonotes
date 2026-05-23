from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class NoteProcessingEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    note_id: int = Field(alias="noteId")
    bucket_name: str = Field(alias="bucketName")
    file_paths: List[str] = Field(alias="filePaths")


class NoteResultDto(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    note_id: int = Field(alias="noteId")
    status: Literal["COMPLETED", "FAILED"]
    recognized_text: Optional[str] = Field(default=None, alias="recognizedText")
    summary_text: Optional[str] = Field(default=None, alias="summaryText")
    error_message: Optional[str] = Field(default=None, alias="errorMessage")

    def model_dump_json_for_rabbit(self) -> str:
        return self.model_dump_json(by_alias=True)
