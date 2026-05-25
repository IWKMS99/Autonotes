package ru.mtuci.autonotesbackend.modules.notes.api.controller;

import io.swagger.v3.oas.annotations.Parameter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ru.mtuci.autonotesbackend.modules.notes.api.NoteFacade;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteDetailDto;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteDto;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.NoteListItemDto;
import ru.mtuci.autonotesbackend.modules.notes.api.dto.PagedResponseDto;
import ru.mtuci.autonotesbackend.security.SecurityUser;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController implements NoteResource {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt", "title", "status");
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "createdAt");

    private final NoteFacade noteFacade;

    @Override
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NoteDto> uploadNote(
            @RequestPart("title") String title,
            @RequestPart("files") List<MultipartFile> files,
            @Parameter(hidden = true) @AuthenticationPrincipal SecurityUser securityUser) {

        NoteDto createdNote = noteFacade.createNote(title, files, securityUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
    }

    @Override
    @GetMapping
    public ResponseEntity<PagedResponseDto<NoteListItemDto>> getAllNotes(
            @Parameter(hidden = true) @AuthenticationPrincipal SecurityUser securityUser,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Pageable normalizedPageable = normalizePageable(pageable);

        Page<NoteListItemDto> notesPage = noteFacade.findAllUserNotes(securityUser.getId(), normalizedPageable);
        return ResponseEntity.ok(PagedResponseDto.from(notesPage));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<NoteDetailDto> getNoteById(
            @PathVariable Long id, @Parameter(hidden = true) @AuthenticationPrincipal SecurityUser securityUser) {

        NoteDetailDto noteDetail = noteFacade.getNoteById(id, securityUser.getId());
        return ResponseEntity.ok(noteDetail);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long id, @Parameter(hidden = true) @AuthenticationPrincipal SecurityUser securityUser) {

        noteFacade.deleteNote(id, securityUser.getId());
        return ResponseEntity.noContent().build();
    }

    private Pageable normalizePageable(Pageable pageable) {
        int page = Math.max(pageable.getPageNumber(), 0);
        int requestedSize = pageable.getPageSize();
        int size = requestedSize <= 0 ? DEFAULT_PAGE_SIZE : Math.min(requestedSize, MAX_PAGE_SIZE);

        Set<Sort.Order> safeOrders = new LinkedHashSet<>();
        for (Sort.Order order : pageable.getSort()) {
            if (ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                safeOrders.add(order);
            }
        }

        Sort sort = safeOrders.isEmpty() ? DEFAULT_SORT : Sort.by(new ArrayList<>(safeOrders));
        return PageRequest.of(page, size, sort);
    }
}
