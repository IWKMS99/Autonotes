package ru.mtuci.autonotesbackend.modules.notes.api;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteDetailDto;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteDto;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteListItemDto;

public interface NoteFacade {
    NoteDto createNote(String title, List<MultipartFile> files, Long userId);

    Page<NoteListItemDto> findAllUserNotes(Long userId, Pageable pageable);

    NoteDetailDto getNoteById(Long noteId, Long userId);

    void deleteNote(Long noteId, Long userId);
}
