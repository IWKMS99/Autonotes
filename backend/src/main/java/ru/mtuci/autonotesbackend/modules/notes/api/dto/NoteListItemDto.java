package ru.mtuci.autonotesbackend.modules.notes.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import lombok.Builder;
import lombok.Data;
import ru.mtuci.autonotesbackend.modules.notes.impl.domain.NoteStatus;

@Data
@Builder
@Schema(description = "Облегченная карточка конспекта для списков")
public class NoteListItemDto {
    @Schema(description = "ID конспекта", example = "42")
    private Long id;

    @Schema(description = "Заголовок конспекта", example = "Лекция по теории вероятностей")
    private String title;

    @Schema(description = "Статус обработки", example = "PROCESSING")
    private NoteStatus status;

    @Schema(description = "Дата создания")
    private OffsetDateTime createdAt;

    @Schema(description = "Дата последнего обновления")
    private OffsetDateTime updatedAt;

    @Schema(description = "Короткий превью-фрагмент summary")
    private String summaryPreview;

    @Schema(description = "Количество изображений в конспекте", example = "3")
    private int imageCount;
}
