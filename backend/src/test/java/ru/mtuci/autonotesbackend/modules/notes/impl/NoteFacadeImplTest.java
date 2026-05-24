package ru.mtuci.autonotesbackend.modules.notes.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteDetailDto;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteDto;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteListItemDto;
import ru.mtuci.autonotesbackend.modules.notes.impl.domain.LectureNote;
import ru.mtuci.autonotesbackend.modules.notes.impl.mapper.NoteMapper;
import ru.mtuci.autonotesbackend.modules.notes.impl.service.NoteService;

@ExtendWith(MockitoExtension.class)
class NoteFacadeImplTest {

    @Mock
    private NoteService noteService;

    @Mock
    private NoteMapper noteMapper;

    @InjectMocks
    private NoteFacadeImpl noteFacade;

    @Test
    void createNote_shouldDelegateToServiceAndMapper() {
        // Arrange
        String title = "Test";
        MultipartFile file = mock(MultipartFile.class);
        List<MultipartFile> files = List.of(file);
        Long userId = 1L;
        LectureNote noteEntity = new LectureNote();
        NoteDto expectedDto = new NoteDto();

        when(noteService.createNote(title, files, userId)).thenReturn(noteEntity);
        when(noteMapper.toDto(noteEntity)).thenReturn(expectedDto);

        // Act
        NoteDto result = noteFacade.createNote(title, files, userId);

        // Assert
        assertThat(result).isSameAs(expectedDto);
        verify(noteService).createNote(title, files, userId);
        verify(noteMapper).toDto(noteEntity);
    }

    @Test
    void findAllUserNotes_shouldDelegateToService() {
        Long userId = 1L;
        PageRequest pageable = PageRequest.of(0, 20);
        Page<NoteListItemDto> expectedNotes = new PageImpl<>(List.of(
                NoteListItemDto.builder().id(1L).title("A").build(),
                NoteListItemDto.builder().id(2L).title("B").build()));
        when(noteService.findAllLightweightDtosByUserId(userId, pageable)).thenReturn(expectedNotes);

        Page<NoteListItemDto> result = noteFacade.findAllUserNotes(userId, pageable);

        assertThat(result).isSameAs(expectedNotes);
        verify(noteService).findAllLightweightDtosByUserId(userId, pageable);
    }

    @Test
    void getNoteById_shouldDelegateToServiceAndMapper() {
        // Arrange
        Long noteId = 42L;
        Long userId = 1L;
        LectureNote noteEntity = new LectureNote();
        NoteDetailDto expectedDetailDto = new NoteDetailDto();

        when(noteService.findByIdAndUserId(noteId, userId)).thenReturn(noteEntity);
        when(noteMapper.toDetailDto(noteEntity)).thenReturn(expectedDetailDto);

        // Act
        NoteDetailDto result = noteFacade.getNoteById(noteId, userId);

        // Assert
        assertThat(result).isSameAs(expectedDetailDto);
        verify(noteService).findByIdAndUserId(noteId, userId);
        verify(noteMapper).toDetailDto(noteEntity);
    }

    @Test
    void deleteNote_shouldDelegateToService() {
        // Arrange
        Long noteId = 42L;
        Long userId = 1L;
        doNothing().when(noteService).deleteByIdAndUserId(noteId, userId);

        // Act
        noteFacade.deleteNote(noteId, userId);

        // Assert
        verify(noteService).deleteByIdAndUserId(noteId, userId);
    }
}
