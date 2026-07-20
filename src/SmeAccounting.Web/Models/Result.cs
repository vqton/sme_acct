namespace SmeAccounting.Web.Models;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T Value { get; }
    public string Error { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
        Error = string.Empty;
    }

    private Result(string error)
    {
        IsSuccess = false;
        Value = default!;
        Error = error;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);
}
